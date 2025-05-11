const db = require('../db/dbConnection');


// Controller function to create a program
const createAchievement = (req, res) => {
  const { username } = req.params;
  const { title, description, date, assoWith, issuer, score, appNo, type } = req.body;


  var iss = null, sc = null, apn = null, assw;
 
  if(type === "Honor and Award"){
    iss = issuer;
  } else if(type === "Test Score"){
    sc = score;
  } else if(type === "Patent"){
    apn = appNo;
  }


  if(!assoWith)
    assw = null;


  if (!title || !description || !date || !type) {
    return res
      .status(400)
      .send("All fields title, description, date, type are required.");
  }


  const queryFindUser = `SELECT user_id FROM user WHERE username = ?`;


  db.query(queryFindUser, [username], (err, userResults) => {
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
      INSERT INTO Achievements (user_id, ach_title, ach_type, ach_asso_with, ach_desc, ach_date, issuer, score ,app_no)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;


    db.query(
      queryInsertClub,
      [userId, title, type, assw, description, date, issuer, score, appNo],
      (err, result) => {
        if (err) {
          console.error("Error inserting achievement:", err);
          return res.status(500).send("Error saving achievement.");
        }


        res.status(201).send({
          message: "Achievement created successfully.",
          programId: result.insertId,
        });
      }
    );
  });
};


module.exports = { createAchievement };






