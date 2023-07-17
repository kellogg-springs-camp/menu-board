var db = require("../db/db-connector");

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

module.exports = getTableFromFK;
