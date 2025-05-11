const db = require('../db/dbConnection');

const getEvents = async (req, res) => {
  const {institute_id} = req.params;
  const sql = `
    SELECT 
      e.event_id,
      e.event_name,
      e.event_description,
      e.event_type,
      e.event_date,
      e.dept_id,
      d.dept_name
    FROM 
      events e
    LEFT JOIN 
      department d ON e.dept_id = d.dept_id
      WHERE d.institute_id = ?
    ORDER BY event_name
  `;

  try {
    const events = await new Promise((resolve, reject) => {
      db.query(sql,[institute_id], (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });

    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getEvents };