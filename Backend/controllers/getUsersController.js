const db = require('../db/dbConnection');

// Controller function to get all departments
const getUsers = async (req, res) => {
  const {institute_id} = req.params;
  const sql = `
    SELECT 
      user_id AS id,
      first_name AS firstName,
      last_name AS lastName,
      username,
      email_id AS email,
      mobile_number AS mobile,
      gender,
      created_at AS accountCreated,
      type_id AS role,
      is_active AS status,
      updated_at AS lastUpdated
    FROM 
      user
      WHERE institute_id = ?
      ORDER BY type_id
  `;

  try {
    const users = await new Promise((resolve, reject) => {
      db.query(sql,[institute_id], (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getUsers };