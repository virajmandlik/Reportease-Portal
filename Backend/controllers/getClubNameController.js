const db = require('../db/dbConnection');


// Controller function to get all departments
const getClubNames = async (req, res) => {
    const { institute_id } = req.params;
  const sql = `SELECT first_name, last_name FROM user u
          INNER JOIN faculty f ON f.user_id = u.user_id
          where u.institute_id = ? ORDER by first_name ASC`;


  try {
    const faculties = await new Promise((resolve, reject) => {
      db.query(sql, [institute_id], (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
    console.log(faculties);


    res.status(200).json(faculties);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


module.exports = { getClubNames };




