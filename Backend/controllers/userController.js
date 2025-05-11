
const db1 = require("../db/dbConnection");

// Fetch User Details
exports.getUserDetails = (req, res) => {
  const userId = req.user.id;

  const query = "SELECT * FROM `user` WHERE user_id = ?";
  db.query(query, [userId], (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Internal server error" });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(results[0]);
  });
};

const db = db1.promise();
exports.getUserById = async (req, res) => {
  const userId = Number(req.params.id);


  if (isNaN(userId)) {
    return res.status(400).json({ message: "Invalid user ID" });
  }


  const sql = "SELECT * FROM user WHERE user_id = ?";


  try {
    const [results] = await db.query(sql, [userId]); // Use the promise-based interface
    if (results.length > 0) {
      return res.status(200).json(results[0]);
    } else {
      return res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.error("Error executing query:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};


exports.updateUser = async (req, res) => {
  const userid = Number(req.params.userid);
  const { first_name, last_name, username } = req.body;


  if (!first_name || !last_name || !username) {
    return res.status(400).json({ message: "All fields are required" });
  }


  const query = `
    UPDATE user
    SET first_name = ?, last_name = ?, username = ?
    WHERE user_id = ?
  `;


  try {
    const [result] = await db.query(query, [first_name, last_name, username, userid]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User not found" });
    }


    return res.status(200).json({ userid, first_name, last_name, username });
  } catch (error) {
    console.error("Error updating user information:", error);
    return res.status(500).json({ message: "Failed to update user information" });
  }
};


