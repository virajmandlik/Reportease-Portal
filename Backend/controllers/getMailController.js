const db = require("../db/dbConnection");


const getUsernameByEmail = (req, res) => {
  const { emailId } = req.body;


  if (!emailId) {
    return res.status(400).json({ message: "Email is required!" });
  }


  try {
    // Query to fetch the username using email_id
    const query = "SELECT username FROM `user` WHERE email_id = ?";
    db.query(query, [emailId], (err, results) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ message: "Internal server error" });
      }


      if (results.length === 0) {
        return res.status(404).json({ message: "User not found!" });
      }


      const username = results[0].username; // Extract the username
      res.status(200).json({ username });
    });
  } catch (err) {
    console.error("Error fetching username:", err);
    res.status(500).json({ message: "Error fetching username!" });
  }
};
module.exports= {getUsernameByEmail};


