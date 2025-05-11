const db = require('../db/dbConnection');


// Controller function to create a program
const createClub = (req, res) => {
  const { institute_id } = req.params;
  const { clubName, clubType, firstName, lastName } = req.body;


  if (!clubName || !clubType || !firstName || !lastName) {
    return res
      .status(400)
      .send("All fields clubName, clubType, firstName, lastName are required.");
  }


  const queryFindUser = `SELECT user_id FROM user WHERE first_name = ? and last_name = ? and institute_id = ?`;


  db.query(queryFindUser, [firstName, lastName, institute_id], (err, userResults) => {
    if (err) {
      console.error("Error finding user:", err);
      return res.status(500).send("Error retrieving user information.");
    }


    if (userResults.length === 0) {
      return res.status(404).send("User not found.");
    }


    const userId = userResults[0].user_id;
    console.log('userId found',userId);


    if (!userId) {
      return res.status(404).send("User is not associated with any department.");
    }


    const queryInsertClub = `
      INSERT INTO Club (club_name, club_head, club_type, institute_id)
      VALUES (?, ?, ?, ?)`;


    db.query(
      queryInsertClub,
      [clubName, userId, clubType, institute_id],
      (err, result) => {
        if (err) {
          console.error("Error inserting club:", err);
          return res.status(500).send("Error saving club.");
        }


        res.status(201).send({
          message: "Club created successfully.",
          programId: result.insertId,
        });
      }
    );
  });
};


module.exports = { createClub };






