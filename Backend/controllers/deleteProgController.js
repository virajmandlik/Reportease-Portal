const db = require('../db/dbConnection');

// Controller function to delete a department
const deleteProgram = (req, res) => {
  const { program_id } = req.params;
  console.log(program_id);

  const queryDeleteProgram = `
    DELETE FROM Program 
    WHERE prog_id = ?`;

  db.query(queryDeleteProgram, [program_id], (err, deleteResults) => {
    if (err) {
      console.error('Error deleting Program:', err);
      return res.status(500).send('Error deleting Program');
    }

    if (deleteResults.affectedRows === 0) {
      return res.status(404).send('Program not found!');
    }

    // Respond with success message
    res.status(200).json({
      message: "Program deleted successfully.",
      department_id,
    });
    console.log('Deleted Program ID:', department_id);
  });
};

module.exports = { deleteProgram };
