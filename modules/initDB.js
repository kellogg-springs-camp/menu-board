var fs = require("fs");
require.extensions[".sql"] = async function (module, filename) {
  var rawSQL = fs.readFileSync(filename, "utf8");
  module.exports = rawSQL.split(";\r\n");
};
var ddl = require("../db/ddl.sql");
var runArrQueries = require("./runArrQueries");

async function initDB() {
  runArrQueries(ddl);
}

module.exports = initBD;
