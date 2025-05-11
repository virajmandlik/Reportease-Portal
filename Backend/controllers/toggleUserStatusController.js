const db = require('../db/dbConnection');

const toggleUserStatus = async (req, res) => {
  const { user_id } = req.params;
  const { status } = req.body;
  console.log("RecData:",user_id,status );

  var st = -1;
  if(status === 'active')
    st = 1;
  else if(status === 'inactive')
    st = 0;

  const sql = `
    UPDATE user 
    SET is_active = ?
    WHERE user_id = ?`;

  try {
    const result = await new Promise((resolve, reject) => {
      db.query(sql, [st, user_id], (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });

    if (result.affectedRows > 0) {
      res.status(200).json({ message: 'User updated successfully.' });
    } else {
      res.status(404).json({ message: 'User not found or no changes made.' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { toggleUserStatus };
