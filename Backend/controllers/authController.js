const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../db/dbConnection");
const secretKey = "your_secret_key";

const md5 = require("md5");
// Remove the sendOtp import since we're not using it anymore
// const sendOtp = require("../utils/sendOtp");

// User Registration
exports.register = async (req, res) => {
  const {
    username,
    first_name,
    last_name,
    email,
    mobile_number,
    gender,
    password,
    usertype,
  } = req.body;

  if (
    !username ||
    !first_name ||
    !last_name ||
    !email ||
    !mobile_number ||
    !gender ||
    !password ||
    !usertype
  ) {
    return res
      .status(400)
      .send(
        "Username, name, email, mobile number, password, gender & usertype all are required!"
      );
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const query =
    "INSERT INTO `user` (user_id, first_name, last_name, email_id, username, mobile_number, password, gender, type_id, institute_id, is_active, created_at, updated_at) VALUES (NULL, ?, ?, ?, ?, ?, ?, ?, ?, NULL, ?, NOW(), NOW())";
  db.query(
    query,
    [
      first_name,
      last_name,
      email,
      username,
      mobile_number,
      hashedPassword,
      gender,
      usertype,
      1,
    ],
    (err, results) => {
      if (err) {
        return res.status(500).send(err);
      }
      res.status(201).json({
        id: results.insertId,
        username,
        first_name,
        last_name,
        email,
      });
    }
  );
};

// User Login
exports.login = async (req, res) => {
  const { username, password } = req.body;
  // console.log("the username & password  is ", username, " ", password);
  const hashedPassword = md5(password);
  const query = "SELECT * FROM `user` WHERE username = ? AND is_active=1";
  db.query(query, [username], async (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Internal server error" });
    }

    if (results.length === 0) {
      // console.log("this is here ");
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const user = results[0];
    // console.log("th eeeresulta re ", results);
    // console.log("the paswrod from bac i s", user.password);
    const isPasswordValid = hashedPassword == user.password;
    // console.log("th epass word is valid ibs ", isPasswordValid);
    // console.log("the iuser is ", user);
    if (!isPasswordValid) {
      // console.log("thi is here");
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const token = jwt.sign(
      {
        id: user.user_id,
        username: user.username,
        first_name: user.first_name,
        last_name: user.last_name,
        type_id: user.type_id,
        role_name: user.role_name,
        email_id: user.email_id,
        mobile_number: user.mobile_number,
        gender: user.gender,
        is_active: user.is_active,
        institute_id: user.institute_id,
        institute_name: user.institute_name,
      },
      secretKey,
      { expiresIn: "12h" }
    );
    
    // Remove OTP generation and sending
    // Return the username with the token so frontend can navigate directly to dashboard
    res.status(200).json({ token, username: user.username });
  });
};
