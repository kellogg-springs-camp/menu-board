/*
    SETUP for a simple webapp
*/
// Express
var fs = require("fs");
var express = require("express"); // We are using the express library for the web server
var exphbs = require("express-handlebars");
var session = require("express-session");
var app = express(); // We need to instantiate an express object to interact with the server in our code
PORT = process.env.PORT || 1989; // Set a port number at the top so it's easy to change in the future

//Database
var db = require("./db/db-connector");
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

app.get("/", (req, res) => {
  res.status(200).render("menu");
});

// app.use("/test", router);

app.get("/api/test", (req, res) => {
  var query = "SELECT * FROM `menus`";
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
        res.status(500).send("Server failed to respond: " + err);
      } else {
        if (existsBool[0].row_exists == 0) {
          var newMenuQ = "INSERT INTO `menus` VALUES(DEFAULT,?,?, DEFAULT);";
          db.pool.query(
            newMenuQ,
            [req.body.date, req.body["meal-type_id"]],
            (error, data, fields) => {
              if (error) {
                res.status(500).send("Server failed to store new menu: " + err);
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
  var newMenuQ =
    "INSERT INTO `menu_items` VALUES((SELECT `id` FROM `menus` WHERE `date` = ? AND `meal-type_id` = ?),?,?,?);";

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
        res.status(500).send("Server failed to store new menu: " + err);
      } else {
        res.status(200).send("New Menu successfully created.");
      }
    }
  );
});

app.get("/api/forms/menu_items", (req, res) => {
  var columnsQ = "SHOW COLUMNS FROM `menu_items`;";
  var fkQ =
    "SELECT COLUMN_NAME, REFERENCED_TABLE_NAME FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE WHERE TABLE_NAME = 'menu_items' AND CONSTRAINT_NAME <> 'PRIMARY' AND REFERENCED_TABLE_NAME IS NOT NULL;";
  db.pool.query(columnsQ, (error, returndata, fields) => {
    if (error) {
      console.log(err);
      res.status(500).send("Server failed to respond: " + err);
    } else {
      db.pool.query(fkQ, (error, fks, fields) => {
        if (error) {
          console.log(err);
          res.status(500).send("Server failed to respond: " + err);
        } else {
          getTableFromFK(fks)
            .then((table) => {
              res.status(200).render("form", {
                layout: false,
                columnNames: columnRename,
                atributeInfo: returndata,
                fkInfo: fks,
                fkTable: table,
                formFor: "menu_items",
                formName: "Add Existing Items",
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

app.get("/api/tables/menu_items", (req, res) => {
  var columnsQ = "SHOW COLUMNS FROM `menu_items`;";
  var fkQ =
    "SELECT COLUMN_NAME, REFERENCED_TABLE_NAME FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE WHERE TABLE_NAME = 'menu_items' AND CONSTRAINT_NAME <> 'PRIMARY' AND REFERENCED_TABLE_NAME IS NOT NULL;";
  db.pool.query(columnsQ, (error, returndata, fields) => {
    if (error) {
      console.log(err);
      res.status(500).send("Server failed to respond: " + err);
    } else {
      db.pool.query(fkQ, (error, fks, fields) => {
        if (error) {
          console.log(err);
          res.status(500).send("Server failed to respond: " + err);
        } else {
          getTableFromFK(fks)
            .then((table) => {
              res.status(200).render("list", {
                columnNames: columnRename,
                atributeInfo: returndata,
                fkInfo: fks,
                fkTable: table,
                formFor: "menu_items",
                formName: "Add Existing Items",
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

app.get("/api/forms/food-items", (req, res) => {
  var columnsQ = "SHOW COLUMNS FROM `food-items`;";
  var fkQ =
    "SELECT COLUMN_NAME, REFERENCED_TABLE_NAME FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE WHERE TABLE_NAME = 'food-items' AND CONSTRAINT_NAME <> 'PRIMARY' AND REFERENCED_TABLE_NAME IS NOT NULL;";
  db.pool.query(columnsQ, (error, returndata, fields) => {
    if (error) {
      console.log(err);
      res.status(500).send("Server failed to respond: " + err);
    } else {
      db.pool.query(fkQ, (error, fks, fields) => {
        if (error) {
          console.log(err);
          res.status(500).send("Server failed to respond: " + err);
        } else {
          getTableFromFK(fks)
            .then((table) => {
              res.status(200).render("form", {
                layout: false,
                columnNames: columnRename,
                atributeInfo: returndata,
                fkInfo: fks,
                fkTable: table,
                formFor: "food-items",
                formName: "Create New Item",
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

app.get("/api/json/menu_items", (req, res) => {
  var columnsQ = "SHOW COLUMNS FROM `menu_items`;";
  var selectQ = "SELECT * FROM `menu_items`;";
  var fkQ =
    "SELECT COLUMN_NAME, REFERENCED_TABLE_NAME FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE WHERE TABLE_NAME = 'menu_items' AND CONSTRAINT_NAME <> 'PRIMARY' AND REFERENCED_TABLE_NAME IS NOT NULL;";
  db.pool.query(selectQ, (error, tabledata, fields) => {
    if (error) {
      console.log(err);
      res.status(500).send("Server failed to respond: " + err);
    } else {
      db.pool.query(columnsQ, (error, returndata, fields) => {
        if (error) {
          console.log(err);
          res.status(500).send("Server failed to respond: " + err);
        } else {
          db.pool.query(fkQ, (error, fks, fields) => {
            if (error) {
              console.log(err);
              res.status(500).send("Server failed to respond: " + err);
            } else {
              getTableFromFK(fks)
                .then((table) => {
                  res.status(200).json({
                    tableData: tabledata,
                    atributeInfo: returndata,
                    fkInfo: fks,
                    fkTable: table,
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
    }
  });
});

app.get("/api/json/menus", (req, res) => {
  var columnsQ = "SHOW COLUMNS FROM `menus`;";
  var fkQ =
    "SELECT COLUMN_NAME, REFERENCED_TABLE_NAME FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE WHERE TABLE_NAME = 'menus' AND CONSTRAINT_NAME <> 'PRIMARY' AND REFERENCED_TABLE_NAME IS NOT NULL;";
  db.pool.query(columnsQ, (error, returndata, fields) => {
    if (error) {
      console.log(err);
      res.status(500).send("Server failed to respond: " + err);
    } else {
      db.pool.query(fkQ, (error, fks, fields) => {
        if (error) {
          console.log(err);
          res.status(500).send("Server failed to respond: " + err);
        } else {
          getTableFromFK(fks)
            .then((table) => {
              res.status(200).json({
                columnNames: columnRename,
                atributeInfo: returndata,
                fkInfo: fks,
                fkTable: table,
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

app.get("/new", (req, res) => {
  var columnsQ = "SHOW COLUMNS FROM `menus`;";
  var fkQ =
    "SELECT COLUMN_NAME, REFERENCED_TABLE_NAME FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE WHERE TABLE_NAME = 'menus' AND CONSTRAINT_NAME <> 'PRIMARY' AND REFERENCED_TABLE_NAME IS NOT NULL;";
  db.pool.query(columnsQ, (error, returndata, fields) => {
    if (error) {
      console.log(err);
      res.status(500).send("Server failed to respond: " + err);
    } else {
      db.pool.query(fkQ, (error, fks, fields) => {
        if (error) {
          console.log(err);
          res.status(500).send("Server failed to respond: " + err);
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

app.listen(PORT, (err) => {
  if (err) throw err;
  console.log("== Server is listening on port", PORT);
});
