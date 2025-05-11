const db = require('../db/dbConnection');

const putClubChanges = (req, res) => {
  const { club_id } = req.params;
  const { club_name, club_type, club_head_email } = req.body;

  const queryFindUser = "SELECT user_id FROM User WHERE email_id = ?";

  db.query(queryFindUser, [club_head_email], (err, userResults) => {
    if (err) {
      console.error('Error finding user:', err);
      return res.status(500).send('Error retrieving user information');
    }

    if (userResults.length === 0) {
      return res.status(404).send("User not found!");
    }

    const userId = userResults[0].user_id;
    console.log('UserID:', userId);

    if (!userId) {
      return res.status(404).send("User does not exist.");
    }

    const queryUpdateClub = `
      UPDATE club 
      SET club_name = ?, 
          club_head = ?,
          club_type = ?
      WHERE club_id = ?`;

    db.query(
      queryUpdateClub,
      [club_name, userId, club_type, club_id],
      (err, updateResults) => {
        if (err) {
          console.error('Error updating Club:', err);
          return res.status(500).send('Error updating Club information');
        }

        if (updateResults.affectedRows === 0) {
          return res.status(404).send("Club not found!");
        }

        // Respond with success message
        res.status(200).json({
          message: "Club details updated successfully.",
          updatedFields: { club_name, club_head_email, club_type },
        });
        console.log('Updated Club Details:', {
            club_name, club_head_email, club_type
        });
      }
    );
  });
};

module.exports = { putClubChanges };
