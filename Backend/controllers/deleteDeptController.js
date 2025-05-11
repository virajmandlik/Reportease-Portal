const db = require('../db/dbConnection');

// Controller function to delete a department
const deleteDepartment = (req, res) => {
  const { department_id } = req.params;

  const queryDeleteDepartment = `
    DELETE FROM Department 
    WHERE dept_id = ?`;

  db.query(queryDeleteDepartment, [department_id], (err, deleteResults) => {
    if (err) {
      console.error('Error deleting department:', err);
      return res.status(500).send('Error deleting department');
    }

    if (deleteResults.affectedRows === 0) {
      return res.status(404).send("Department not found!");
    }

    // Respond with success message
    res.status(200).json({
      message: "Department deleted successfully.",
      department_id,
    });
    console.log('Deleted Department ID:', department_id);
  });
};

module.exports = { deleteDepartment };
