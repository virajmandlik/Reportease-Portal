const db = require('../db/dbConnection');

// Controller function to delete a club
const deleteClub = (req, res) => {
  const { club_id } = req.params;

  const queryDeleteClub = `
    DELETE FROM club 
    WHERE club_id = ?`;

  db.query(queryDeleteClub, [club_id], (err, deleteResults) => {
    if (err) {
      console.error('Error deleting club:', err);
      return res.status(500).send('Error deleting club');
    }

    if (deleteResults.affectedRows === 0) {
      return res.status(404).send("Club not found!");
    }

    // Respond with success message
    res.status(200).json({
      message: "Club deleted successfully.",
      club_id,
    });
    console.log('Deleted Club ID:', club_id);
  });
};

module.exports = { deleteClub };
