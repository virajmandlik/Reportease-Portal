const db = require('../db/dbConnection');

// Controller function to get all departments
const getClubs = async (req, res) => {
  const {institute_id} = req.params;
  const sql = `
    SELECT 
      c.club_id,
      c.club_name,
      c.club_type,
      u.email_id
    FROM 
      club c
    INNER JOIN 
      user u ON c.club_head = u.user_id
      WHERE u.institute_id = ?
  `;

  try {
    const infra = await new Promise((resolve, reject) => {
      db.query(sql,[institute_id], (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });

    res.status(200).json(infra);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getClubs };