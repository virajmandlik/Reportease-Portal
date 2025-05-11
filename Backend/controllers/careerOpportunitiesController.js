const db = require('../db/dbConnection');


// Controller function to add a career opportunity for a user
const addOpportunity = (req, res) => {
  const { username, organization, position, income, startsFrom, endsOn, type } = req.body;


  // Validate required fields
  var end = endsOn;
  if(end === undefined)
    end = null;
  if (!username || !organization || !position || !income || !startsFrom || !type) {
    return res
      .status(400);
  }


  // Step 1: Find the user by username
  const userQuery = 'SELECT user_id FROM user WHERE username = ?';
  db.query(userQuery, [username], (err, userRows) => {
    if (err) {
      console.error('Error finding user:', err);
      return res.status(500).send('Error retrieving user information.');
    }


    if (userRows.length === 0) {
      return res.status(404).send("User  not found!");
    }


    const userId = userRows[0].user_id;


    // Step 2: Insert the opportunity into the careeropportunities table
    const queryInsertOpportunity = `
      INSERT INTO careeropportunities (user_id, organization, position, income, starts_from, ends_on, type, year)
      VALUES (?, ?, ?, ?, ?, ?, ?, YEAR(CURDATE()))
    `;


    db.query(queryInsertOpportunity, [userId, organization, position, income, startsFrom, end, type], (err, results) => {
      if (err) {
        console.error('Error adding opportunity:', err);
        return res.status(500).send('Failed to add opportunity.');
      }


      res.status(201).json({ message: 'Opportunity added successfully!' });
    });
  });
};


module.exports = { addOpportunity };



