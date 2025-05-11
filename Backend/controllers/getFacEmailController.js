const db = require('../db/dbConnection');

const getFacultyEmails = async (req, res) => {
    const { institute_id } = req.params;
  const sql = `SELECT email_id FROM user u
          INNER JOIN faculty f ON f.user_id = u.user_id
          where u.institute_id = ? ORDER by email_id ASC`;

  try {
    const departments = await new Promise((resolve, reject) => {
      db.query(sql, [institute_id], (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
    console.log(departments);

    res.status(200).json(departments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getFacultyEmails };
