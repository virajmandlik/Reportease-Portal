const db = require('../db/dbConnection');

// Controller function to get the department name by coordinator_id
const getDepartmentByCoordinator = async (req, res) => {
  const { userid } = req.params; // Extract the user ID from the request parameters
  const sql = `SELECT dept_type FROM department WHERE coordinator_id  = ?`;
console.log('the userid got is ',userid)
  try {
    const department = await new Promise((resolve, reject) => {
      db.query(sql, [userid], (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });

    if (department.length > 0) {
      // Send the first department's name
      res.status(200).json({ dept_type: department[0].dept_type });
    } else {
      // If no department is found
      res.status(404).json({ message: "No department type found for the given coordinator ID" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getDepartmentByCoordinator };
