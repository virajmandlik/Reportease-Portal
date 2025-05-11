const db = require('../db/dbConnection');

// Controller function to get all departments
const getDepartments = async (req, res) => {
  const sql = `
    SELECT 
      d.dept_id AS department_id,
      d.dept_name,
      d.dept_type,
      d.institute_id,
      u.user_id AS coordinator_id,
      u.first_name AS coordinator_first_name,
      u.last_name AS coordinator_last_name,
      u.email_id AS coordinator_email
    FROM 
      department d
    LEFT JOIN 
      user u ON d.coordinator_id = u.user_id
  `;

  try {
    const departments = await new Promise((resolve, reject) => {
      db.query(sql, (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });

    res.status(200).json(departments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getDepartments };
