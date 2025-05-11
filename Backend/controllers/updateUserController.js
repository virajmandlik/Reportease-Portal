const db = require("../db/dbConnection");


const handleUpdate = (data) => {
  return new Promise((resolve, reject) => {
    data.forEach((row) => {
      const { name, age, email } = row;


      const checkQuery = "SELECT * FROM users WHERE email = ?";
      db.query(checkQuery, [email], (err, results) => {
        if (err) return reject(err);


        if (results.length > 0) {
          const updateQuery =
            "UPDATE users SET name = ?, age = ? WHERE email = ?";
          db.query(updateQuery, [name, age, email], (err) => {
            if (err) return reject(err);
          });
        } else {
          const insertQuery =
            "INSERT INTO users (name, age, email) VALUES (?, ?, ?)";
          db.query(insertQuery, [name, age, email], (err) => {
            if (err) return reject(err);
          });
        }
      });
    });
    resolve();
  });
};


module.exports = { handleUpdate };



