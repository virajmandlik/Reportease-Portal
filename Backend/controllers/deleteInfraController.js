const db = require('../db/dbConnection');

// Controller function to delete a club
const deleteInfra = (req, res) => {
  const { infra_id } = req.params;

  const queryDeleteInfra = `
    DELETE FROM infrastructure 
    WHERE infra_id = ?`;

  db.query(queryDeleteInfra, [infra_id], (err, deleteResults) => {
    if (err) {
      console.error('Error deleting Infrastructure:', err);
      return res.status(500).send('Error deleting Infrastructure');
    }

    if (deleteResults.affectedRows === 0) {
      return res.status(404).send("Infrastructure not found!");
    }

    // Respond with success message
    res.status(200).json({
      message: "Infrastructure deleted successfully.",
      infra_id,
    });
    console.log('Deleted Infrastructure ID:', infra_id);
  });
};

module.exports = { deleteInfra };
