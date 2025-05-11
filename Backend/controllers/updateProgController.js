const db = require('../db/dbConnection');

const putProgChanges = async (req, res) => {
  const { program_id } = req.params;
  const { program_name, duration, intake, semester_count } = req.body;
  console.log("RecData:",program_name, duration, intake, semester_count );

  const sql = `
    UPDATE program 
    SET prog_name = ?, duration = ?, intake = ?, semester_count = ?
    WHERE prog_id = ?`;

  try {
    const result = await new Promise((resolve, reject) => {
      db.query(sql, [program_name, duration, intake, semester_count, program_id], (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });

    if (result.affectedRows > 0) {
      res.status(200).json({ message: 'Program updated successfully.' });
    } else {
      res.status(404).json({ message: 'Program not found or no changes made.' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { putProgChanges };
