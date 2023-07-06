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

app.get("/api/menus", function (req, res) {
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
                    res.status(200).render("newmenu", {
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
