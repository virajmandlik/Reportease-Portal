const db = require('../db/dbConnection');

// Controller function to get all departments
const getPrograms = async (req, res) => {
  const {institute_id} = req.params;
  const sql = `
    SELECT 
      p.prog_id AS program_id,
      p.prog_name,
      p.dept_id,
      p.duration,
      p.intake,
      p.semester_count,
      d.dept_name
    FROM 
      program p
    LEFT JOIN 
      department d ON p.dept_id = d.dept_id
      WHERE d.dept_id = ?
    ORDER BY prog_name
  `;

  try {
    const programs = await new Promise((resolve, reject) => {
      db.query(sql,[institute_id], (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });

    res.status(200).json(programs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getPrograms };