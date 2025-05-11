const db = require('../db/dbConnection');
const md5 = require('md5'); // Ensure md5 is installed or use any preferred hashing method
const sendOtp = require("../utils/sendOtp");
// Controller function to register an institute admin
const registerInstituteAdmin = (req, res) => {
  const { username, first_name, last_name, email, mobile_number, gender, password, usertype } = req.body;

  // Validate required fields
  if (!username || !first_name || !last_name || !email || !mobile_number || !gender || !password || !usertype) {
    res.status(400).send("Username, name, email, mobile number, password, gender & usertype all are required!");
    return;
  }

  // Hash the password
  const hashedPassword = md5(password);
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  // SQL query to insert the new user
  const query = `
    INSERT INTO User (
      user_id, first_name, last_name, email_id, username, mobile_number, password, gender, type_id, institute_id, is_active,otp   ) 
    VALUES (
      NULL, ?, ?, ?, ?, ?, ?, ?, ?, NULL, ?,?
    )
  `;

  // Execute the query
  db.query(
    query,
    [first_name, last_name, email, username, mobile_number, hashedPassword, gender, 1, 1,otp],
    (err, results) => {
      if (err) {
        console.error('Error registering institute admin:', err);
        res.status(500).send('Error registering institute admin.');
        return;
      }

      // Respond with success
      sendOtp(email, otp);
      // After sending OTP
      
      // req.session.email = email; // Store email in session
      console.log(email);
      return res.status(200).send("OTP sent successfully");``
    }
  );
};

module.exports = { registerInstituteAdmin };
