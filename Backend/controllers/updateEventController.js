const db = require('../db/dbConnection');

const putEventChanges = async (req, res) => {
  const { event_id } = req.params;
  const { event_name, event_description, event_type, event_date } = req.body;
  console.log("RecData:",event_id, event_name, event_description, event_type, event_date );

  const sql = `
    UPDATE events 
    SET event_name = ?, event_description = ?, event_type = ?, event_date = ?
    WHERE event_id = ?`;

  try {
    const result = await new Promise((resolve, reject) => {
      db.query(sql, [event_name, event_description, event_type, event_date, event_id], (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });

    if (result.affectedRows > 0) {
      res.status(200).json({ message: 'Event updated successfully.' });
    } else {
      res.status(404).json({ message: 'Event not found or no changes made.' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { putEventChanges };
