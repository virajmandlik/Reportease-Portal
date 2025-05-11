const db = require('../db/dbConnection');

// Controller function to get all departments
const getInfrastructure = async (req, res) => {
  const {institute_id} = req.params;
  const sql = `
    SELECT 
      i.infra_id,
      d.dept_name as department,
      i.description,
      i.budget,
      i.startdate,
      i.enddate
    FROM 
      infrastructure i
    INNER JOIN 
      department d ON i.dept_id = d.dept_id
      WHERE d.institute_id = ?
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

module.exports = { getInfrastructure };