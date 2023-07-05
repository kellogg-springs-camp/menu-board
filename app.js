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
// var dailyMenus = require("./json/dailyMenus.json");
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

app.post("/api/newday", function (req, res) {
  dailyMenus.push(req.body);

  fs.writeFile(
    "./json/dailyMenus.json",
    JSON.stringify(dailyMenus, null, 2),
    function (err) {
      if (err) {
        res.status(500).send("Failed to add data.");
      } else {
        res.status(200).send("Data successfully uploaded.");
      }
    }
  );
});

app.get("/new", function (req, res) {
  res.status(200).render("newmenu");
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
