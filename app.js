/*
    SETUP for a simple webapp
*/
// Express
var fs = require("fs");
var express = require("express"); // We are using the express library for the web server
var exphbs = require("express-handlebars");
var app = express(); // We need to instantiate an express object to interact with the server in our code
PORT = process.env.PORT || 1989; // Set a port number at the top so it's easy to change in the future
require.extensions[".sql"] = async function (module, filename) {
  var rawSQL = fs.readFileSync(filename, "utf8");
  module.exports = rawSQL.split(";\r\n");
};
//Database
var db = require("./db-connector");
var ddl = require("./ddl.sql");
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
app.use("/public", express.static("./public/"));

async function getTableFromFK(fkInfo) {
  var retVal = {};
  for (var i = 0; i < fkInfo.length; i++) {
    var columnsQ =
      "SHOW COLUMNS FROM `" + fkInfo[i].REFERENCED_TABLE_NAME + "`;";
    try {
      const results = await new Promise((resolve, reject) => {
        db.pool.query(columnsQ, function (err, results, fields) {
          if (err) {
            reject(err);
          } else {
            resolve(results);
          }
        });
      });
      // console.log(results);
      retVal[fkInfo[i].COLUMN_NAME] = {
        name: results.find((column) => column.Field.includes("name")),
        id: results.find((column) => column.Field.includes("id")),
      }; // Resolve the promise with the query results
    } catch (error) {
      console.log(error);
      throw error; // Re-throw the error to be caught in the calling code
    }
    var columnsQ = "SELECT * FROM `" + fkInfo[i].REFERENCED_TABLE_NAME + "`;";
    try {
      const results = await new Promise((resolve, reject) => {
        db.pool.query(columnsQ, function (err, results, fields) {
          if (err) {
            reject(err);
          } else {
            resolve(results);
          }
        });
      });
      // console.log(results);
      retVal[fkInfo[i].COLUMN_NAME]["select"] = results;
      // console.log(retVal);
    } catch (error) {
      console.log(error);
      throw error; // Re-throw the error to be caught in the calling code
    }
  }
  return retVal;
}

async function runArrQueries(sqlArr) {
  for (var query of sqlArr) {
    // console.log(query);
    if (query) {
      query += ";";
      try {
        const results = await new Promise((resolve, reject) => {
          db.pool.query(query, function (err, results, fields) {
            if (err) {
              reject(err);
            } else {
              resolve(results);
            }
          });
        });
        // console.log(results);
      } catch (error) {
        console.log(error);
      }
    }
  }
}

async function runSingleQueries(query) {
  // console.log(query);
  if (query) {
    try {
      const results = await new Promise((resolve, reject) => {
        db.pool.query(query, function (err, results, fields) {
          if (err) {
            reject(err);
          } else {
            resolve(results);
          }
        });
      });
      // console.log(results);
      return results; // Resolve the promise with the query results
    } catch (error) {
      console.log(error);
      throw error; // Re-throw the error to be caught in the calling code
    }
  } else {
    throw new Error("Query is missing."); // Throw an error if query is not provided
  }
}

runArrQueries(ddl);

app.get("/", function (req, res) {
  res.status(200).render("menu");
});

app.get("/test", function (req, res) {
  var data = {
    layout: false,
  };
  res.status(200).render("test", data);
});

app.post("/api/createmenu", function (req, res) {
  var existsQ =
    "SELECT EXISTS(SELECT 1 FROM menus WHERE date = '" +
    req.body.date +
    "' AND `meal-type_id` = '" +
    req.body["meal-type_id"] +
    "') AS row_exists;";
  runSingleQueries(existsQ)
    .then(function (existsBool) {
      console.log(existsBool[0].row_exists);
      if (existsBool[0].row_exists == 0) {
        var newMenuQ =
          "INSERT INTO menus VALUES(DEFAULT,'" +
          req.body.date +
          "','" +
          req.body["meal-type_id"] +
          "', DEFAULT);";
        try {
          runSingleQueries(newMenuQ)
            .then((data) => {
              res.status(200).send("New Menu successfully created.");
            })
            .catch((err) => {
              res.status(500).send("Server failed to store new menu: " + err);
            });
        } catch (err) {
          res.status(500).send("Server failed to store new menu: " + err);
        }
      } else {
        res.status(200).send("Menu already exists.");
      }
    })
    .catch((err) => {
      res.status(500).send("Server failed to respond: " + err);
    });
});

app.post("/api/createmenu_item", function (req, res) {
  var newMenuQ =
    "INSERT INTO `menu_items` VALUES((SELECT `id` FROM menus WHERE date = '" +
    req.body.date +
    "' AND `meal-type_id` = '" +
    req.body["meal-type_id"] +
    "'),'" +
    req.body["food-item_id"] +
    "','" +
    req.body["serve-line_id"] +
    "'," +
    req.body.servings +
    ");";
  try {
    runSingleQueries(newMenuQ)
      .then((data) => {
        res.status(200).send("New Menu successfully created.");
      })
      .catch((err) => {
        res.status(500).send("Server failed to store new menu: " + err);
      });
  } catch (err) {
    res.status(500).send("Server failed to store new menu: " + err);
  }
});

app.get("/api/forms/menu_items", (req, res) => {
  var columnsQ = "SHOW COLUMNS FROM menu_items;";
  var fkQ =
    "SELECT COLUMN_NAME, REFERENCED_TABLE_NAME FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE WHERE TABLE_NAME = 'menu_items' AND CONSTRAINT_NAME <> 'PRIMARY' AND REFERENCED_TABLE_NAME IS NOT NULL;";
  runSingleQueries(columnsQ)
    .then(function (returndata) {
      // console.log("results " + returndata);
      try {
        runSingleQueries(fkQ)
          .then(function (fks) {
            // console.log("results " + fks);
            try {
              getTableFromFK(fks)
                .then(function (table) {
                  // console.log("results " + table);
                  try {
                    res.status(200).render("form", {
                      layout: false,
                      columnNames: columnRename,
                      atributeInfo: returndata,
                      fkInfo: fks,
                      fkTable: table,
                      formFor: "menu_items",
                      formName: "Add Existing Items",
                    });
                  } catch (err) {
                    res.status(500).send("Server failed to respond: " + err);
                  }
                })
                .catch((err) => {
                  console.log(err);
                  res.status(500).send("Server failed to respond: " + err);
                });
            } catch (err) {
              res.status(500).send("Server failed to respond: " + err);
            }
          })
          .catch((err) => {
            console.log(err);
            res.status(500).send("Server failed to respond: " + err);
          });
      } catch (err) {
        res.status(500).send("Server failed to respond: " + err);
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send("Server failed to respond: " + err);
    });
});

app.get("/api/tables/menu_items", (req, res) => {
  var columnsQ = "SHOW COLUMNS FROM menu_items;";
  var fkQ =
    "SELECT COLUMN_NAME, REFERENCED_TABLE_NAME FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE WHERE TABLE_NAME = 'menu_items' AND CONSTRAINT_NAME <> 'PRIMARY' AND REFERENCED_TABLE_NAME IS NOT NULL;";
  runSingleQueries(columnsQ)
    .then(function (returndata) {
      // console.log("results " + returndata);
      try {
        runSingleQueries(fkQ)
          .then(function (fks) {
            // console.log("results " + fks);
            try {
              getTableFromFK(fks)
                .then(function (table) {
                  // console.log("results " + table);
                  try {
                    res.status(200).render("list", {
                      columnNames: columnRename,
                      atributeInfo: returndata,
                      fkInfo: fks,
                      fkTable: table,
                      formFor: "menu_items",
                      formName: "Add Existing Items",
                    });
                  } catch (err) {
                    res.status(500).send("Server failed to respond: " + err);
                  }
                })
                .catch((err) => {
                  console.log(err);
                  res.status(500).send("Server failed to respond: " + err);
                });
            } catch (err) {
              res.status(500).send("Server failed to respond: " + err);
            }
          })
          .catch((err) => {
            console.log(err);
            res.status(500).send("Server failed to respond: " + err);
          });
      } catch (err) {
        res.status(500).send("Server failed to respond: " + err);
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send("Server failed to respond: " + err);
    });
});

app.get("/api/forms/food-items", (req, res) => {
  var columnsQ = "SHOW COLUMNS FROM `food-items`;";
  var fkQ =
    "SELECT COLUMN_NAME, REFERENCED_TABLE_NAME FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE WHERE TABLE_NAME = 'food-items' AND CONSTRAINT_NAME <> 'PRIMARY' AND REFERENCED_TABLE_NAME IS NOT NULL;";
  runSingleQueries(columnsQ)
    .then(function (returndata) {
      // console.log("results " + returndata);
      try {
        runSingleQueries(fkQ)
          .then(function (fks) {
            // console.log("results " + fks);
            try {
              getTableFromFK(fks)
                .then(function (table) {
                  // console.log("results " + table);
                  try {
                    res.status(200).render("form", {
                      layout: false,
                      columnNames: columnRename,
                      atributeInfo: returndata,
                      fkInfo: fks,
                      fkTable: table,
                      formFor: "food-items",
                      formName: "Create New Item",
                    });
                  } catch (err) {
                    res.status(500).send("Server failed to respond: " + err);
                  }
                })
                .catch((err) => {
                  console.log(err);
                  res.status(500).send("Server failed to respond: " + err);
                });
            } catch (err) {
              res.status(500).send("Server failed to respond: " + err);
            }
          })
          .catch((err) => {
            console.log(err);
            res.status(500).send("Server failed to respond: " + err);
          });
      } catch (err) {
        res.status(500).send("Server failed to respond: " + err);
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send("Server failed to respond: " + err);
    });
});

app.get("/api/json/menu_items", (req, res) => {
  var columnsQ = "SHOW COLUMNS FROM `menu_items`;";
  var selectQ = "SELECT * FROM `menu_items`;";
  var fkQ =
    "SELECT COLUMN_NAME, REFERENCED_TABLE_NAME FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE WHERE TABLE_NAME = 'menu_items' AND CONSTRAINT_NAME <> 'PRIMARY' AND REFERENCED_TABLE_NAME IS NOT NULL;";
  runSingleQueries(selectQ)
    .then(function (tabledata) {
      // console.log("results " + returndata);
      try {
        runSingleQueries(columnsQ)
          .then(function (returndata) {
            // console.log("results " + returndata);
            try {
              runSingleQueries(fkQ)
                .then(function (fks) {
                  // console.log("results " + fks);
                  try {
                    getTableFromFK(fks)
                      .then(function (table) {
                        // console.log("results " + table);
                        try {
                          res.status(200).json({
                            tableData: tabledata,
                            atributeInfo: returndata,
                            fkInfo: fks,
                            fkTable: table,
                          });
                        } catch (err) {
                          res
                            .status(500)
                            .send("Server failed to respond: " + err);
                        }
                      })
                      .catch((err) => {
                        console.log(err);
                        res
                          .status(500)
                          .send("Server failed to respond: " + err);
                      });
                  } catch (err) {
                    res.status(500).send("Server failed to respond: " + err);
                  }
                })
                .catch((err) => {
                  console.log(err);
                  res.status(500).send("Server failed to respond: " + err);
                });
            } catch (err) {
              res.status(500).send("Server failed to respond: " + err);
            }
          })
          .catch((err) => {
            console.log(err);
            res.status(500).send("Server failed to respond: " + err);
          });
      } catch (err) {
        res.status(500).send("Server failed to respond: " + err);
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send("Server failed to respond: " + err);
    });
});

app.get("/api/json/menus", function (req, res) {
  var columnsQ = "SHOW COLUMNS FROM menus;";
  var fkQ =
    "SELECT COLUMN_NAME, REFERENCED_TABLE_NAME FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE WHERE TABLE_NAME = 'menus' AND CONSTRAINT_NAME <> 'PRIMARY' AND REFERENCED_TABLE_NAME IS NOT NULL;";
  runSingleQueries(columnsQ)
    .then(function (returndata) {
      // console.log("results " + returndata);
      try {
        runSingleQueries(fkQ)
          .then(function (fks) {
            // console.log("results " + fks);
            try {
              getTableFromFK(fks)
                .then(function (table) {
                  // console.log("results " + table);
                  try {
                    res.status(200).json({
                      columnNames: columnRename,
                      atributeInfo: returndata,
                      fkInfo: fks,
                      fkTable: table,
                    });
                  } catch (err) {
                    res.status(500).send("Server failed to respond: " + err);
                  }
                })
                .catch((err) => {
                  console.log(err);
                  res.status(500).send("Server failed to respond: " + err);
                });
            } catch (err) {
              res.status(500).send("Server failed to respond: " + err);
            }
          })
          .catch((err) => {
            console.log(err);
            res.status(500).send("Server failed to respond: " + err);
          });
      } catch (err) {
        res.status(500).send("Server failed to respond: " + err);
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send("Server failed to respond: " + err);
    });
});

app.get("/new", function (req, res) {
  var columnsQ = "SHOW COLUMNS FROM menus;";
  var fkQ =
    "SELECT COLUMN_NAME, REFERENCED_TABLE_NAME FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE WHERE TABLE_NAME = 'menus' AND CONSTRAINT_NAME <> 'PRIMARY' AND REFERENCED_TABLE_NAME IS NOT NULL;";
  runSingleQueries(columnsQ)
    .then(function (returndata) {
      // console.log("results " + returndata);
      try {
        runSingleQueries(fkQ)
          .then(function (fks) {
            // console.log("results " + fks);
            try {
              getTableFromFK(fks)
                .then(function (table) {
                  // console.log("results " + table);
                  try {
                    res.status(200).render("form", {
                      columnNames: columnRename,
                      atributeInfo: returndata,
                      fkInfo: fks,
                      fkTable: table,
                      formFor: "menus",
                      formName: "Edit Menu",
                    });
                  } catch (err) {
                    res.status(500).send("Server failed to respond: " + err);
                  }
                })
                .catch((err) => {
                  console.log(err);
                  res.status(500).send("Server failed to respond: " + err);
                });
            } catch (err) {
              res.status(500).send("Server failed to respond: " + err);
            }
          })
          .catch((err) => {
            console.log(err);
            res.status(500).send("Server failed to respond: " + err);
          });
      } catch (err) {
        res.status(500).send("Server failed to respond: " + err);
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send("Server failed to respond: " + err);
    });
});

app.get("*", function (req, res) {
  res.status(404).render("404");
});

// Error-handling middleware
app.use(function (err, req, res, next) {
  console.error(err); // Log the error for debugging purposes

  // Send the error message to the client
  res.status(500).send("Failed to store data: " + err.message);
});

app.listen(PORT, function (err) {
  if (err) throw err;
  console.log("== Server is listening on port", PORT);
});
