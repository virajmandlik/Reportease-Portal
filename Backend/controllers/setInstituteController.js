const db = require('../db/dbConnection');

// Controller function to update institute details
const setInstituteDetails = (req, res) => {
  const { username } = req.params;
  const { institute, addressl1, subdist, district, state, country } = req.body;

  // console.log('Username:', username);

  // Step 1: Find the user by username to get the `institute_id`
  const queryFindUser = "SELECT institute_id FROM User WHERE username = ?";

  db.query(queryFindUser, [username], (err, userResults) => {
    if (err) {
      console.error('Error finding user:', err);
      return res.status(500).send('Error retrieving user information');
    }

    if (userResults.length === 0) {
      return res.status(404).send("User not found!");
    }

    const instituteId = userResults[0].institute_id;
    // console.log('InstituteID:', instituteId);

    if (!instituteId) {
      return res.status(404).send("Institute not associated with the user.");
    }

    // Step 2: Update institute details using the `institute_id`
    const queryUpdateInstitute = `
      UPDATE Institute 
      SET institute_name = ?, 
          address_lines = ?, 
          subdistrict = ?, 
          district = ?, 
          state = ?, 
          country = ? 
      WHERE institute_id = ?`;

    db.query(
      queryUpdateInstitute,
      [institute, addressl1, subdist, district, state, country, instituteId],
      (err, updateResults) => {
        if (err) {
          console.error('Error updating institute:', err);
          return res.status(500).send('Error updating institute information');
        }

        if (updateResults.affectedRows === 0) {
          return res.status(404).send("Institute not found!");
        }

        // Respond with success message
        res.status(200).json({
          message: "Institute details updated successfully.",
          updatedFields: { institute, addressl1, subdist, district, state, country },
        });
     
      }
    );
  });
};

module.exports = { setInstituteDetails };
