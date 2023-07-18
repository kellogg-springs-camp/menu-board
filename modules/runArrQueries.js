var db = require("../private/db-connector");

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

module.exports = runArrQueries;
