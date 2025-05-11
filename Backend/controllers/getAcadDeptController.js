const db = require('../db/dbConnection');


// Controller function to get all departments
const getAcadDepartmentNames = async (req, res) => {
    const { institute_id } = req.params;
  const sql = `SELECT dept_name FROM department where institute_id = ? and dept_type = ?`;
  const type = "Academic";


  try {
    const departments = await new Promise((resolve, reject) => {
      db.query(sql, [institute_id, type], (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
    // console.log(departments);


    res.status(200).json(departments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


module.exports = { getAcadDepartmentNames };





