const db = require("../db/dbConnection");
const md5 = require("md5");
const sendOtp = require("../utils/sendOtp");

const registerFaculty = async (req, res) => {
  const {
    first_name,
    last_name,
    email,
    username,
    mobile_number,
    gender,
    password,
    institute,
    faculty_reg_id,
    department,
    usertype,
  } = req.body;
  // console.log("usertype is ", usertype);
  // Check if all required fields are provided
  if (
    !first_name ||
    !last_name ||
    !email ||
    !username ||
    !mobile_number ||
    !gender ||
    !password ||
    !institute ||
    !faculty_reg_id
  ) {
    return res.status(400).send("All fields are required!");
  }
  // console.log("faculty reg is ", faculty_reg_id);

  try {
    const [Result] = await db
    .promise()
    .query(
      "SELECT  institute_domain FROM institute WHERE institute_name = ?",
      [institute]
    );


  if (Result.length === 0) {
    return res.status(404).send("Institute not found!");
  }


  const {  institute_domain } =
    Result[0];
    console.log(institute_domain)


  // Validate email against institute domain
  if (!email.includes(institute_domain)) {
    return res
      .status(400)
      .send("Please register with a verified institute email ID.");
  }






  
    
    
    // Hash the password (use bcrypt for security, not md5)
    const hashedPassword = md5(password); // Replace with bcrypt for more security

    // Query to get the institute_id using institute name
    const [instituteResult] = await db
      .promise()
      .query("SELECT institute_id FROM institute WHERE institute_name = ?", [
        institute,
      ]);

    if (instituteResult.length === 0) {
      return res.status(404).send("Institute not found!");
    }
    const instituteId = instituteResult[0].institute_id;
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    // Query to insert the faculty user into the User table
    await db.promise().query(
      `INSERT INTO User (first_name, last_name, email_id, username, mobile_number, password, gender, type_id, institute_id, is_active, created_at,otp)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, true, NOW(),?)`,
      [
        first_name,
        last_name,
        email,
        username,
        mobile_number,
        hashedPassword,
        gender,
        3,
        instituteId,
        otp,
      ]
    );

    sendOtp(email, otp);

    // ////////
    // find the user_id from the user table  for that email_id
    const getUserIdQuery = "SELECT user_id FROM user WHERE email_id = ?";
    db.query(getUserIdQuery, [email], (err, userResults) => {
      if (err) {
        console.error("Error fetching user_id:", err);
        return res.status(500).send("Internal Server Error");
      }

      if (userResults.length === 0) {
        return res.status(404).send("User  not found");
      }

      const userId = userResults[0].user_id; // Get user_id
      // console.log(userId);
      // Step 2: Find dept_id from department table
      // find the depart_id from the depart nemae comin gfro tfrontend
      const getDeptIdQuery =
        "SELECT dept_id FROM department WHERE dept_name = ?";
      db.query(getDeptIdQuery, [department], (err, deptResults) => {
        if (err) {
          console.error("Error fetching dept_id:", err);
          return res.status(500).send("Internal Server Error");
        }

        if (deptResults.length === 0) {
          return res.status(404).send("Department not found");
        }

        const deptId = deptResults[0].dept_id; // Get dept_id
        // console.log(deptId);
        // Step 3: Insert into faculty table
        const insertFacultyQuery =
          "INSERT INTO faculty (User_id, reg_no, Dept_id) VALUES (?, ?, ?)";
        db.query(
          insertFacultyQuery,
          [userId, faculty_reg_id, deptId],
          (err, insertResults) => {
            if (err) {
              console.error("Error inserting faculty:", err);
              return res.status(500).send("Internal Server Error");
            }

            // Successfully inserted
            // sendOtp(email, otp);
            res.status(200).send("Faculty registered successfully");
          }
        );
      });
    });
    // now inserting into faculty table
    // User_id  ,Faculty_Reg_Number ,Dept_id
    /////////
    
    
      // sendOtp(email, otp);
      // After sending OTP
      
      // req.session.email = email; // Store email in session
      console.log(email);
      // res.json({ user_id: userId, message: "Registration successful" });
      // return res.status(200).send("OTP sent successfully");
     
  } catch (err) {
    console.error(err);
    // If there's an error, delete the user entry if it was created
    console.log('viru... is in controllr of faculty')
    if (email) {
      await db.promise().query("DELETE FROM User WHERE email_id = ?", [email]);
    }
    res.status(500).send("Error registering institute faculty: " + err.message);
  }
};

module.exports = { registerFaculty };