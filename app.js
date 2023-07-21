/*
    SETUP for a simple webapp
*/
// Express
var fs = require("fs");
const https = require("https");
var express = require("express"); // We are using the express library for the web server
var exphbs = require("express-handlebars");
var session = require("express-session");
var app = express(); // We need to instantiate an express object to interact with the server in our code
PORT = process.env.PORT || 1989; // Set a port number at the top so it's easy to change in the future

//Database
var db = require("./private/db-connector");
var getTableFromFK = require("./modules/getTableFromFK");
var initDB = require("./modules/initDB");
// var router = require("./routes/index");
var columnRename = require("./json/column-rename.json");

//Handlebars
const hbs = exphbs.create({
  defaultLayout: "main",
  helpers: {
    hasForeignKey: function (columnName, fkInfo) {
      const matchingForeignKey = fkInfo.find(
        (fk) => fk.COLUMN_NAME === columnName
      );
      return matchingForeignKey ? "FK" : "";
    },
    ifEquals: function (columnName, fkInfo) {
      const matchingForeignKey = fkInfo.find(
        (fk) => fk.COLUMN_NAME === columnName
      );
      return matchingForeignKey ? true : false;
    },
    isEquals: function (x, y) {
      return x === y ? true : false;
    },
    getReferenceTable: function (columnName, fkInfo) {
      const matchingForeignKey = fkInfo.find(
        (fk) => fk.COLUMN_NAME === columnName
      );
      return matchingForeignKey.REFERENCED_TABLE_NAME;
    },
    getFKNameFromId: function (idValue, jsonTable) {
      for (const obj of jsonTable) {
        if (obj.hasOwnProperty("id") && obj.id === idValue) {
          return obj.name;
        }
      }
      return null;
    },
  },
});

// Configure Express to use the custom handlebars instance
app.engine("handlebars", hbs.engine);
app.set("view engine", "handlebars");

app.use(express.json());
app.use(
  session({
    secret: "ksc",
    resave: true,
    saveUninitialized: true,
  })
);
app.use("/public", express.static("./public/"));

initDB();

function isAuthenticated(req, res, next) {
  console.log(req.session.user);
  if (req.session.user) {
    next();
  } else {
    res.send(
      '<form action="/login" method="post">' +
        'Username: <input name="user"><br>' +
        'Password: <input name="pass" type="password"><br>' +
        '<input type="submit" text="Login"></form>'
    );
  }
}

https
  .createServer(
    {
      key: fs.readFileSync("./private/key.pem"),
      cert: fs.readFileSync("./private/cert.pem"),
    },
    app
  )
  .listen(PORT, (err) => {
    if (err) throw err;
    console.log("== Server is listening on port", PORT);
  });

app.get("/", (req, res) => {
  var currentDate = new Date();
  currentDate.setTime(currentDate.getTime() + 7200000);
  var q1 =
    "SELECT * FROM `menu_items` WHERE (`menu_id` = (SELECT `id` FROM `menus` WHERE `date` = " +
    currentDate.toISOString().slice(0, 10) +
    " AND `service-time` < " +
    currentDate.toTimeString().slice(0, 8) +
    "));";
  res.status(200).render("menu");
});

app.get("/test", isAuthenticated, function (req, res) {
  var data = {
    layout: false,
    title: "Express",
    session: req.session,
  };
  res.status(200).render("test", data);
});

app.post(
  "/login",
  express.urlencoded({ extended: false }),
  function (req, res) {
    // login logic to validate req.body.user and req.body.pass
    // would be implemented here. for this example any combo works
    var user_email_address = req.body.user;

    var user_password = req.body.pass;

    if (user_email_address && user_password) {
      query = `
        SELECT * FROM employees 
        WHERE username = "${user_email_address}"
        `;

      db.pool.query(query, function (error, data) {
        if (data.length > 0) {
          for (var count = 0; count < data.length; count++) {
            if (data[count].password == user_password) {
              // regenerate the session, which is good practice to help
              // guard against forms of session fixation
              req.session.user = req.body.user;
              res.redirect("back");
            } else {
              res.send("Incorrect Password");
            }
          }
        } else {
          res.send("Incorrect Email Address");
        }
        res.end();
      });
    } else {
      res.send("Please Enter Email Address and Password Details");
      res.end();
    }
  }
);

app.get("/api/test", (req, res) => {
  var query = "SHOW SESSION STATUS LIKE 'Ssl_cipher';";
  db.pool.query(query, function (error, results, fields) {
    res.status(200).json({
      rows: results,
      columns: fields,
    });
  });
});

app.post("/api/createmenu", (req, res) => {
  var existsQ =
    "SELECT EXISTS(SELECT 1 FROM `menus` WHERE `date` = ? AND `meal-type_id` = ?) AS row_exists;";
  db.pool.query(
    existsQ,
    [req.body.date, req.body["meal-type_id"]],
    (error, existsBool, fields) => {
      if (error) {
        res.status(500).send("Server failed to respond: " + error);
      } else {
        if (existsBool[0].row_exists == 0) {
          var newMenuQ = "INSERT INTO `menus` VALUES(DEFAULT,?,?,DEFAULT);";
          db.pool.query(
            newMenuQ,
            [req.body.date, req.body["meal-type_id"]],
            (error, data, fields) => {
              if (error) {
                res
                  .status(500)
                  .send("Server failed to store new menu: " + error);
              } else {
                res.status(200).send("New Menu successfully created.");
              }
            }
          );
        } else {
          res.status(200).send("Menu already exists.");
        }
      }
    }
  );
});

app.post("/api/createmenu_item", (req, res) => {
  var updateTimeQ =
    "UPDATE `menus` SET `service-time` = ? WHERE (`date` = ? AND `meal-type_id` = ?);";
  var newItemQ = "INSERT INTO `food-items` VALUES (DEFAULT,?,?);";
  var getNewItemIdQ = "SELECT LAST_INSERT_ID();";
  var newMenuQ =
    "INSERT INTO `menu_items` VALUES((SELECT `id` FROM `menus` WHERE `date` = ? AND `meal-type_id` = ?),?,?,DEFAULT);";
  db.pool.query(
    updateTimeQ,
    [req.body["service-time"], req.body.date, req.body["meal-type_id"]],
    (error, data, fields) => {
      if (error) {
        console.log(error);
        res.status(500).send("Server failed to store new menu: " + error);
      } else {
        if (!req.body["food-item_id"]) {
          db.pool.query(
            newItemQ,
            [req.body["food-item_name"], req.body.description],
            (error, data, fields) => {
              if (error) {
                console.log(error);
                res
                  .status(500)
                  .send("Server failed to store new menu: " + error);
              } else {
                db.pool.query(getNewItemIdQ, (error, data, fields) => {
                  console.log(data);
                  if (error) {
                    console.log(error);
                    res
                      .status(500)
                      .send("Server failed to store new menu: " + error);
                  } else {
                    db.pool.query(
                      newMenuQ,
                      [
                        req.body.date,
                        req.body["meal-type_id"],
                        data[0]["LAST_INSERT_ID()"],
                        req.body["serve-line_id"],
                        req.body.servings,
                      ],
                      (error, data, fields) => {
                        if (error) {
                          console.log(error);
                          res
                            .status(500)
                            .send("Server failed to store new menu: " + error);
                        } else {
                          res
                            .status(200)
                            .send("New Menu successfully created.");
                        }
                      }
                    );
                  }
                });
              }
            }
          );
        } else {
          db.pool.query(getNewItemIdQ, (error, data, fields) => {
            if (error) {
              console.log(error);
              res.status(500).send("Server failed to store new menu: " + error);
            } else {
              db.pool.query(
                newMenuQ,
                [
                  req.body.date,
                  req.body["meal-type_id"],
                  req.body["food-item_id"],
                  req.body["serve-line_id"],
                  req.body.servings,
                ],
                (error, data, fields) => {
                  if (error) {
                    console.log(error);
                    res
                      .status(500)
                      .send("Server failed to store new menu: " + error);
                  } else {
                    res.status(200).send("New Menu successfully created.");
                  }
                }
              );
            }
          });
        }
      }
    }
  );
});

app.post("/api/forms/menu_items", (req, res) => {
  var serviceTimeQ =
    "SELECT `service-time` FROM `menus` WHERE `date` = ? AND `meal-type_id` = ?;";
  var foodItemsQ = "SELECT `id`, `name` FROM `food-items`;";
  var servelineQ = "SELECT `id`, `name` FROM `serve-line`;";
  var menuItemsQ =
    "SELECT * FROM `menu_items` WHERE `menu_id` = (SELECT `id` FROM `menus` WHERE `date` = ? AND `meal-type_id` = ?);";
  db.pool.query(
    serviceTimeQ,
    [req.body.date, req.body["meal-type_id"]],
    (error, serviceTimeData, fields) => {
      if (error) {
        console.log(error);
        res.status(500).send("Server failed to respond: " + error);
      } else {
        db.pool.query(foodItemsQ, (error, foodItemData, fields) => {
          if (error) {
            console.log(error);
            res.status(500).send("Server failed to respond: " + error);
          } else {
            db.pool.query(servelineQ, (error, servelineData, fields) => {
              if (error) {
                console.log(error);
                res.status(500).send("Server failed to respond: " + error);
              } else {
                db.pool.query(
                  menuItemsQ,
                  [req.body.date, req.body["meal-type_id"]],
                  (error, menuItemData, fields) => {
                    if (error) {
                      console.log(error);
                      res
                        .status(500)
                        .send("Server failed to respond: " + error);
                    } else {
                      res.status(200).render("menuitemsform", {
                        layout: false,
                        serviceTime: serviceTimeData[0]["service-time"],
                        foodItems: foodItemData,
                        serveLines: servelineData,
                        menuItems: menuItemData,
                      });
                    }
                  }
                );
              }
            });
          }
        });
      }
    }
  );
});

app.get("/new", isAuthenticated, (req, res) => {
  var columnsQ = "SHOW COLUMNS FROM `menus`;";
  var fkQ =
    "SELECT COLUMN_NAME, REFERENCED_TABLE_NAME FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE WHERE TABLE_NAME = 'menus' AND CONSTRAINT_NAME <> 'PRIMARY' AND REFERENCED_TABLE_NAME IS NOT NULL;";
  db.pool.query(columnsQ, (error, returndata, fields) => {
    if (error) {
      console.log(error);
      res.status(500).send("Server failed to respond: " + error);
    } else {
      db.pool.query(fkQ, (error, fks, fields) => {
        if (error) {
          console.log(error);
          res.status(500).send("Server failed to respond: " + error);
        } else {
          getTableFromFK(fks)
            .then((table) => {
              res.status(200).render("form", {
                columnNames: columnRename,
                atributeInfo: returndata,
                fkInfo: fks,
                fkTable: table,
                formFor: "menus",
                formName: "Edit Menu",
              });
            })
            .catch((err) => {
              console.log(err);
              res.status(500).send("Server failed to respond: " + err);
            });
        }
      });
    }
  });
});

app.get("*", (req, res) => {
  res.status(404).render("404");
});

// Error-handling middleware
app.use((err, req, res, next) => {
  console.error(err); // Log the error for debugging purposes

  // Send the error message to the client
  res.status(500).send("Failed to store data: " + err.message);
});
