const db = require('../db/dbConnection');

// Controller function to create an institute and associate it with a user
const createInstitute = (req, res) => {
  const { username, institute, addressl1, subdist, district, state, country } = req.body;

  // Validate required fields
  if (!username || !institute || !subdist || !district || !state || !country) {
    return res
      .status(400)
      .send("Institute name, address lines, subdistrict, district, state, and country are required!");
  }

  // Step 1: Insert the institute into the `Institute` table
  const queryInsertInstitute = `
    INSERT INTO Institute (institute_id, institute_name, address_lines, subdistrict, district, state, country) 
    VALUES (NULL, ?, ?, ?, ?, ?, ?)
  `;

  db.query(queryInsertInstitute, [institute, addressl1, subdist, district, state, country], (err, results) => {
    if (err) {
      console.error('Error inserting institute:', err);
      return res.status(500).send('Error creating institute.');
    }

    const instituteId = results.insertId;

    // Step 2: Find the user by username
    const queryFindUser = "SELECT user_id FROM User WHERE username = ?";
    db.query(queryFindUser, [username], (err, userResults) => {
      if (err) {
        console.error('Error finding user:', err);
        return res.status(500).send('Error retrieving user information.');
      }

      if (userResults.length === 0) {
        return res.status(404).send("User not found!");
      }

      const userId = userResults[0].user_id;

      // Step 3: Update the user to associate the institute_id
      const queryUpdateUser = "UPDATE User SET institute_id = ? WHERE user_id = ?";
      db.query(queryUpdateUser, [instituteId, userId], (err, updateResults) => {
        if (err) {
          console.error('Error updating user:', err);
          return res.status(500).send('Error associating user with the institute.');
        }

        // Respond with success
        res.status(201).json({
          id: instituteId,
          institute,
          addressl1,
          subdist,
          district,
          state,
          country,
          user_id: userId,
        });
      });
    });
  });
};

module.exports = { createInstitute };
