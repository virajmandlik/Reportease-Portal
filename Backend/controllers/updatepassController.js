

const db = require("../db/dbConnection"); // Adjust path as needed
const crypto = require('crypto');




exports.updatePassword = (req, res) => {
  const { userId, currentPassword, newPassword } = req.body;


  if (!userId || !currentPassword || !newPassword) {
    return res.status(400).json({ error: 'All fields are required.' });
  }


  try {
    // Hash the current password using MD5
    const currentPasswordHash = crypto.createHash('md5').update(currentPassword).digest('hex');


    // Fetch the stored password hash from the database
    const query = 'SELECT password FROM user WHERE user_id = ?';
    db.query(query, [userId], (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Database error.' });
      }


      if (results.length === 0) {
        return res.status(404).json({ error: 'User not found.' });
      }


      const storedPasswordHash = results[0].password;


      // Compare the current password hash
      if (currentPasswordHash !== storedPasswordHash) {
        return res.status(401).json({ error: 'Incorrect current password.' });
      }


      // Hash the new password using MD5 (not recommended for new systems)
      const newPasswordHash = crypto.createHash('md5').update(newPassword).digest('hex');


      // Update the password in the database
      const updateQuery = 'UPDATE user SET password = ? WHERE user_id = ?';
      db.query(updateQuery, [newPasswordHash, userId], (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: 'Database error.' });
        }
        res.status(200).json({ message: 'Password updated successfully.' });
      });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error. Please try again later.' });
  }
};








