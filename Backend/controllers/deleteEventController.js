const db = require('../db/dbConnection');

// Controller function to delete a department
const deleteEvent = (req, res) => {
  const { event_id } = req.params;

  const queryDeleteEvent = `
    DELETE FROM Events
    WHERE event_id = ?`;

  db.query(queryDeleteEvent, [event_id], (err, deleteResults) => {
    if (err) {
      console.error('Error deleting Event:', err);
      return res.status(500).send('Error deleting Event');
    }

    if (deleteResults.affectedRows === 0) {
      return res.status(404).send('Event not found!');
    }

    // Respond with success message
    res.status(200).json({
      message: "Event deleted successfully.",
      event_id,
    });
    console.log('Deleted Event ID:', event_id);
  });
};

module.exports = { deleteEvent };
