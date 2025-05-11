const cors = require("cors");
const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const md5 = require("md5");
const cookieParser = require("cookie-parser");
const path = require("path");
const fs = require("fs");
const app = express();
const corsOptions = {
  origin: 'http://localhost:5173', // Specify the frontend URL here
  methods: ['GET', 'POST', "PUT", "DELETE"],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

const corsConfig = require('./cors-config');

app.use(cors(corsConfig));
// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));
// This will allow inline scripts and styles by setting 'unsafe-inline' (not recommended for production)
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; font-src 'self' data:"
  );
  next();
});
app.use('/html_reports', express.static(path.join(__dirname, 'public', 'html_reports')));

app.use(cors(corsOptions));
const port = 3000;
const xlsx = require("xlsx");
const db = require("./db/dbConnection");
const multer = require("multer");
// Comment out the sendOtp import since we're not using it anymore
// const sendOtp=require("./utils/sendOtp.js");
const pdfRoutes = require('./pdfGenModule/routes/allPdfAndHtmlRoutes.js')
app.options("*", cors()); // Allow all OPTIONS requests for CORS preflight

app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.set("views", "./pdfGenModule/views");

// Add this before your route definitions
app.use((req, res, next) => {
  console.log(`Received ${req.method} request to ${req.path}`);
  next();
});

// Add error handling middleware at the end of your route configurations
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  res.status(500).json({
    message: 'An unexpected error occurred',
    error: err.message
  });
});
app.use("/pdf", pdfRoutes);
app.use(
  cors({
    origin: ["http://localhost:5173"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);
app.use(cors({
  origin: 'http://localhost:5173', // Allow requests from your frontend
  methods: ['GET', 'POST'], // Specify allowed methods
  credentials: true, // Allow credentials (if needed)
}));
app.use(cookieParser());


// Serve the 'pdfs' directory statically
app.use('/pdfs', express.static(path.join(__dirname, 'public', 'pdfs')));


const secretKey = "your_secret_key";

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    return res.status(403).send("A token is required for authentication");
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(403).send("A token is required for authentication");
  }

  try {
    const decoded = jwt.verify(token, secretKey);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).send("Invalid Token");
  }
};
const updateRoutes = require("./routes/updateRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const programRoutes = require("./routes/programRoutes");
const createInstituteRoutes = require("./routes/createInstituteRoutes");
const departmentRoutes = require("./routes/departmentRoutes");
const getDeptRoutes = require("./routes/getDeptRoutes");
const getInstituteRoutes = require("./routes/getInstituteRoutes");
const registerInstAdminRoutes = require("./routes/registerInstAdminRoutes");
const setInstituteRoutes = require("./routes/setInstituteRoutes");
const authRoutes = require("./routes/authRoutes");
const registerFacultyRoutes = require("./routes/registerFacultyRoutes.js");
const eventRoutes = require("./routes/eventRoutes.js");
const getDepartmentNames = require("./routes/getDeptNameRoutes.js");
const getAcadDepartmentNames = require("./routes/getAcadDeptRoutes.js");
const submitFacultyFeedbacks = require("./routes/submitFacultyFeedbackRoutes.js");
const studentRoutes = require("./routes/studentRoutes");
const enrollmentRoutes = require("./routes/enrollmentRoutes");
const addResearchData = require("./routes/researchRoutes");
const addOpportunity = require("./routes/careerOpportunities");
const addInfrastructure = require("./routes/infraRoutes");
const financeRoutes = require("./routes/financeRoutes");
const postFinanceRoutes = require("./routes/postFinanceRoutes");
const placementRoutes = require("./routes/PlacementRoutes.js");
const placementSingleRoutes = require('./routes/placementSingleRoutes'); 
const visualRoutes = require('./routes/visualRoutes.js')
const clubRoutes = require("./routes/clubRoutes");
const achievementRoutes = require("./routes/achievementRoutes");
const getClubNames = require("./routes/getClubNameRoutes")
const courseRoutes = require("./routes/CreatecourseRoutes.js");
const userRoutes = require('./routes/userRoutes');
const profileRoutes = require('./routes/profileRoutes');
const eventRouter = require("./routes/CreateBulkEventRoutes.js");
const bulkProgramRouter = require("./routes/bulkProgramRouter.js");
const bulkCreateCourseRoute = require("./routes/BulkCreateCourseRoute.js");
const getFacultyEmailRoutes = require("./routes/getFacEmailRoutes");
const putDeptChangesRoutes = require("./routes/putDeptRoutes");
const deleteDeptRoutes = require("./routes/deleteDeptRoutes");
const getProgRoutes = require("./routes/getProgRoutes");
const putProgChangesRoutes = require("./routes/putProgRoutes");
const deleteProgramRoutes = require("./routes/deleteProgRoutes");
const getEvents = require("./routes/getEventRoutes");
const putEventChangesRoutes = require("./routes/putEventRoutes");
const deleteEventRoutes = require("./routes/deleteEventRoutes");
const getInstituteClubNamesRoutes = require('./routes/getInstituteClubNamesRoutes.js')
const departmentByCordIdRoutes = require('./routes/departmentByCordIdRoutes')
const instAdminDashRoutes = require("./routes/instAdminDashRoutes");
const putInfraRoutes = require("./routes/putInfraRoutes");
const deleteInfraRoutes = require("./routes/deleteInfraRoutes");
const getInfraRoutes = require("./routes/getInfraRoutes");
const putClubRoutes = require("./routes/putClubRoutes");
const deleteClubRoutes = require("./routes/deleteClubRoutes");
const getClubRoutes = require("./routes/getClubRoutes");
const getUsersRoutes = require("./routes/getUsersRoutes");
const toggleUserStatus = require("./routes/toggleUserStatusRoutes");
const BulkDepartment = require('./routes/BulkDepartmentRoutes.js')
const getActivityLog = require("./routes/activityLogRoutes");
const accessControlRoutes = require("./routes/accessControlRoutes.js");
const getUsernameByEmail=require("./routes/getEmailRoute");
const updatepassRoutes=require("./routes/updatepassRoutes");




app.use("/api",updatepassRoutes)
app.use("/api", uploadRoutes);
app.use("/api", updateRoutes);
app.use("/api", programRoutes);
app.use("/api", createInstituteRoutes);
app.use("/api", departmentRoutes);
app.use("/api", getDeptRoutes);
app.use("/api", getInstituteRoutes);
app.use("/api", registerInstAdminRoutes);
app.use("/api", setInstituteRoutes);
app.use("/api", authRoutes);
app.use("/api", registerFacultyRoutes);
app.use("/api", eventRoutes);
app.use("/api", getDepartmentNames);
app.use("/api", getAcadDepartmentNames);
app.use("/api", submitFacultyFeedbacks);
app.use("/api", studentRoutes);
app.use("/api", enrollmentRoutes);
app.use("/api", addResearchData);
app.use("/api", addOpportunity);
app.use("/api", addInfrastructure);
app.use("/api", financeRoutes);
app.use("/api", postFinanceRoutes);
app.use("/api/placements", placementRoutes);  
app.use("/api", placementSingleRoutes);
app.use("/api",visualRoutes)
app.use("/api", clubRoutes);
app.use("/api", achievementRoutes);
app.use("/api", getClubNames);
app.use("/api/course", courseRoutes);
app.use("/api/events", eventRouter);
app.use("/api/bulk-program", bulkProgramRouter);
app.use("/api/course", bulkCreateCourseRoute);
app.use("/api", getFacultyEmailRoutes);
app.use("/api", putDeptChangesRoutes);
app.use("/api", deleteDeptRoutes);
app.use("/api", getProgRoutes);
app.use("/api", putProgChangesRoutes);
app.use("/api", deleteProgramRoutes);
app.use("/api", getEvents);
app.use("/api", putEventChangesRoutes);
app.use("/api", deleteEventRoutes)
app.use("/api",getInstituteClubNamesRoutes);
app.use("/api",departmentByCordIdRoutes)
app.use("/api", instAdminDashRoutes);
app.use("/api", putInfraRoutes);
app.use("/api", deleteInfraRoutes);
app.use("/api", getInfraRoutes);
app.use("/api", putClubRoutes);
app.use("/api", deleteClubRoutes);
app.use("/api", getClubRoutes);
app.use("/api", getProgRoutes);
app.use("/api", putProgChangesRoutes);
app.use("/api", deleteProgramRoutes);
app.use("/api", getUsersRoutes);
app.use("/api", toggleUserStatus);
app.use("/api/departments",BulkDepartment)
app.use("/api", getActivityLog);
app.use("/api", accessControlRoutes);
app.use('/api',getUsernameByEmail);
//HK add Courses



// Comment out or remove OTP verification endpoints
// app.post("/verify", (req, res) => {
//   const {otp,emailId} = req.body; // Retrieve OTP and user_id from request body

//   console.log("otp",otp);
//   // user_id=sessionStorage.getItem("user_id");
//   if (!otp ) {
//     return res.status(400).send("OTP are required");
//   }

//   console.log("email",emailId);
//   db.query(
//     "SELECT * FROM user WHERE  email_id = ? AND otp = ?",
//     [emailId, otp],
//     (err, results) => {
//       if (err) {
//         console.error("Error verifying OTP:", err);
//         return res.status(500).send("Internal Server Error");
//       }
//       console.log(results);

//       if (results.length === 0) {
//         return res.status(400).send("Invalid OTP");
//       }

//       // If OTP is valid, update the user's verification status
//       db.query(
//         "UPDATE User SET isVerified = 1, otp = NULL WHERE email_id = ?",
//         [emailId],
//         (err) => {
//           if (err) {
//             console.error("Error updating user verification:", err);
//             return res.status(500).send("Verification failed");
//           }

//           // Send a success response
//           return res.status(200).send("User verified successfully");
//         }
//       );
//     }
//   );
// });

// Comment out or remove the second OTP verification endpoint
// app.post("/verify-otp", (req, res) => {
//   const { userId, otp } = req.body;
//   let email="";
//   const query = "SELECT email_id FROM user WHERE user_id = ?";
  
//   db.query(query, [userId], (err, results) => {
//     if (err) return res.status(500).json({ error: "Database error." });

//     if (results.length === 0) {
//       return res.status(404).json({ error: "User not found." });
//     }

//     email = results[0].email_id;
//     console.log("email is .....", results[0].email_id);
//   });
//   // const email=
//   console.log("email is ", email);
//   const query1 =
//     "SELECT * FROM user WHERE user_id = ? AND otp = ? AND isVerified = 0";
//     console.log("email in ")
//   db.query(query1, [userId, otp], (err, results) => {
//     if (err) return res.status(500).json({ error: "Database error." });

//     if (results.length === 0) {
//       return res.status(400).json({ error: "Invalid or expired OTP." });
//     }

//     res.status(200).json({ message: "OTP verified." });
//   });
// });

// Fetch Programs
app.post("/programs", (req, res) => {
  const { user_id } = req.body;
  console.log("Received User ID:", user_id); // Log user_id here to verify
  console.log("Userid Is: ", user_id);
  if (!user_id) {
    return res.status(400).send("User ID is required");
  }

  const query = `
    SELECT prog.prog_id, prog.prog_name
    FROM program AS prog
    WHERE prog.dept_id = (
      SELECT dept.dept_id
      FROM department AS dept
      WHERE dept.coordinator_id = ?
    )
  `;

  db.query(query, [user_id], (err, results) => {
    if (err) {
      console.error("Error fetching programs:", err);
      return res.status(500).send("Error fetching programs");
    }

    if (results.length === 0) {
      console.log("No programs found for user ID:", user_id); // Log no results
      return res.status(404).send("No programs found for the given user ID");
    }
    console.log("Fetched Programs:", results);
    res.json(results);
  });
});

// Add Course
app.post("/api/add", (req, res) => {
  const { course_name, program_id, semester } = req.body;

  // Validate input
  if (!course_name || !program_id || !semester) {
    return res.status(400).send("All fields are required");
  }

  const query = `
    INSERT INTO courses (course_name, program_id, semester)
    VALUES (?, ?, ?)
  `;

  db.query(query, [course_name, program_id, semester], (err, result) => {
    if (err) {
      console.error("Error adding course:", err);
      return res.status(500).send("Error adding course");
    }

    res.status(201).send("Course added successfully");
  });
});

// API endpoint to get department by user_id
app.get("/get-department/:user_id", (req, res) => {
  const { user_id } = req.params; // Accessing the user_id from the route parameters
  console.log("The coordinator ID is:", user_id);

  db.query(
    "SELECT dept_name FROM department WHERE coordinator_id = ?",
    [user_id],
    (error, results) => {
      if (error) {
        console.error("Error fetching department:", error);
        return res
          .status(500)
          .json({ message: "An error occurred while fetching the department" });
      }

      if (results.length === 0) {
        return res.status(404).json({ message: "Department not found" });
      }

      const department = results[0];
      res.status(200).json({ dept_name: department.dept_name });
    }
  );
});

//HK add Courses
app.listen(port, () => {
  console.log(`App is listening on port ${port}`);
});

app.post("/register/institute-admin", (req, res) => {
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

  // console.log(mobile_number);
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
    res
      .status(400)
      .send(
        "Username, name, email, mobile number, password, gender & usertype all are required!"
      );
    return;
  }

  const hashedPassword = md5(password);

  const query =
    "INSERT INTO User ( first_name, last_name, email_id, username, mobile_number, password, gender, type_id, institute_id, is_active, created_at, updated_at) VALUES ( ?, ?, ?, ?, ?, ?, ?, ?, NULL, ?, NULL, NULL)";
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
        console.log(err);
        res.status(500).send(err);
        return;
      }
      res
        .status(201)
        .json({ id: results.insertId, first_name, last_name, email });
    }
  );
});

// updated
app.post("/loginMe", (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = md5(password);
  
  console.log("Login attempt for username:", username);

  // Single query to get user data, without relying on roles table
  const query = "SELECT * FROM user WHERE username = ? AND password = ?";
  
  db.query(query, [username, hashedPassword], (err, results) => {
    if (err) {
      console.error("Database error during login:", err);
      return res.status(500).json({ message: "Database error during login" });
    }
    
    if (results.length === 0) {
      console.log("No matching user found for username:", username);
      return res.status(401).json({ message: "Invalid username or password" });
    }
    
    const user = results[0];
    console.log("Login successful for user:", user.username);
    
    // Create token with user data (no need to check roles)
    const tokenPayload = {
      id: user.user_id,
      username: user.username,
      first_name: user.first_name,
      last_name: user.last_name,
      type_id: user.type_id, // Keep type_id for permission checks
      email_id: user.email_id,
      mobile_number: user.mobile_number,
      gender: user.gender,
      is_active: user.is_active,
      institute_id: user.institute_id
    };
    
    // Get institute name if institute_id exists
    if (user.institute_id) {
      const instituteQuery = "SELECT institute_name FROM institute WHERE institute_id = ?";
      
      db.query(instituteQuery, [user.institute_id], (instErr, instResults) => {
        if (instErr) {
          console.error("Error querying institute:", instErr);
          // Continue without institute name
          const token = jwt.sign(tokenPayload, secretKey, { expiresIn: "12h" });
          return res.status(200).json({ token, username: user.username });
        }
        
        if (instResults.length > 0) {
          tokenPayload.institute_name = instResults[0].institute_name;
        }
        
        const token = jwt.sign(tokenPayload, secretKey, { expiresIn: "12h" });
        console.log("Login successful for user with institute:", user.username);
        res.status(200).json({ token, username: user.username });
      });
    } else {
      // No institute_id, no need for additional query
      const token = jwt.sign(tokenPayload, secretKey, { expiresIn: "12h" });
      console.log("Login successful for user (no institute):", user.username);
      res.status(200).json({ token, username: user.username });
    }
  });
});
app.post("/create-institute", (req, res) => {
  const {
    username,
    institute,
    addressl1,
    subdist,
    district,
    state,
    country,
    enrollmentKey,
  } = req.body;
  console.log(
    username,
    institute,
    addressl1,
    subdist,
    district,
    state,
    country,
    enrollmentKey
  );
  // console.log('State: ',state);

  // Validate required fields
  if (
    !username ||
    !institute ||
    !subdist ||
    !district ||
    !state ||
    !country ||
    !enrollmentKey
  ) {
    return res
      .status(400)
      .send(
        "Institute name, address lines, subdistrict, district, state, country and enrollmentKey are required!"
      );
  }

  // Step 1: Insert the institute into the Institute table
  const queryInsertInstitute =
    "INSERT INTO Institute (Enrollment_key, institute_name ,address_lines, subdistrict, district, state, country) VALUES ( ?, ? ,?, ?, ?, ?, ?)";

  db.query(
    queryInsertInstitute,
    [enrollmentKey, institute, addressl1, subdist, district, state, country],
    (err, results) => {
      if (err) {
        // console.log('error is ',err)
        return res.status(500).send(err);
      }
      console.log(results);
      const instituteId = results.insertId;
      console.log(instituteId);
      // Step 2: Find the user by username and update their institute_id
      const queryFindUser = "SELECT user_id FROM User WHERE username = ?";

      db.query(queryFindUser, [username], (err, userResults) => {
        if (err) {
          return res.status(500).send(err);
        }

        if (userResults.length === 0) {
          return res.status(404).send("User  not found!");
        }

        const userId = userResults[0].user_id;

        // Step 3: Update the User table to set the institute_id
        const queryUpdateUser =
          "UPDATE User SET institute_id = ? WHERE user_id = ?";

        db.query(
          queryUpdateUser,
          [instituteId, userId],
          (err, updateResults) => {
            if (err) {
              return res.status(500).send(err);
            }

            // Respond with the created institute information and user ID
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
          }
        );
      });
    }
  );
});

// create faculty
// app.post("/register/institute-faculty", async (req, res) => {
//   const {
//     first_name,
//     last_name,
//     email,
//     username,
//     mobile_number,
//     gender,
//     password,
//     institute,
//     faculty_reg_id,
//     department,
//     usertype
//   } = req.body;
//   console.log("usertype is ", usertype);
//   // Check if all required fields are provided
//   if (
//     !first_name ||
//     !last_name ||
//     !email ||
//     !username ||
//     !mobile_number ||
//     !gender ||
//     !password ||
//     !institute ||
//     !faculty_reg_id
//   ) {
//     return res.status(400).send("All fields are required!");
//   }
//   console.log("faculty reg is ", faculty_reg_id);

//   try {
//     // Hash the password (use bcrypt for security, not md5)
//     const hashedPassword = md5(password); // Replace with bcrypt for more security

//     // Query to get the institute_id using institute name
//     const [instituteResult] = await db
//       .promise()
//       .query("SELECT institute_id FROM institute WHERE institute_name = ?", [
//         institute,
//       ]);

//     if (instituteResult.length === 0) {
//       return res.status(404).send("Institute not found!");
//     }
//     const instituteId = instituteResult[0].institute_id;

//     // Query to insert the faculty user into the User table
//     await db.promise().query(
//       `INSERT INTO User (first_name, last_name, email_id, username, mobile_number, password, gender, type_id, institute_id, is_active, created_at)
//          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, true, NOW())`,
//       [
//         first_name,
//         last_name,
//         email,
//         username,
//         mobile_number,
//         hashedPassword,
//         gender,
//         3,
//         instituteId,
//       ]
//     );

//     ////////
//     // find the user_id from the user table  for that email_id
//     const getUserIdQuery = "SELECT user_id FROM user WHERE email_id = ?";
//     db.query(getUserIdQuery, [email], (err, userResults) => {
//       if (err) {
//         console.error("Error fetching user_id:", err);
//         return res.status(500).send("Internal Server Error");
//       }

//       if (userResults.length === 0) {
//         return res.status(404).send("User  not found");
//       }

//       const userId = userResults[0].user_id; // Get user_id
//       console.log(userId);
//       // Step 2: Find dept_id from department table
//       // find the depart_id from the depart nemae comin gfro tfrontend
//       const getDeptIdQuery =
//         "SELECT dept_id FROM department WHERE dept_name = ?";
//       db.query(getDeptIdQuery, [department], (err, deptResults) => {
//         if (err) {
//           console.error("Error fetching dept_id:", err);
//           return res.status(500).send("Internal Server Error");
//         }

//         if (deptResults.length === 0) {
//           return res.status(404).send("Department not found");
//         }

//         const deptId = deptResults[0].dept_id; // Get dept_id
//         console.log(deptId);
//         // Step 3: Insert into faculty table
//         const insertFacultyQuery =
//           "INSERT INTO faculty (User_id, reg_no, Dept_id) VALUES (?, ?, ?)";
//         db.query(
//           insertFacultyQuery,
//           [userId, faculty_reg_id, deptId],
//           (err, insertResults) => {
//             if (err) {
//               console.error("Error inserting faculty:", err);
//               return res.status(500).send("Internal Server Error");
//             }

//             // Successfully inserted
//             res.status(201).send("Faculty registered successfully");
//           }
//         );
//       });
//     });
//     // now inserting into faculty table
//     // User_id  ,Faculty_Reg_Number ,Dept_id
//     /////////
//     res
//       .status(201)
//       .json({ message: "Institute faculty registered successfully" });
//   } catch (err) {
//     console.error(err);
//     res.status(500).send("Error registering institute faculty: " + err.message);
//   }
// });

// Endpoint to get all institutes
app.get("/institutes", (req, res) => {
  const query = "SELECT institute_name, Enrollment_key FROM Institute";

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching institutes:", err);
      return res.status(500).send("Internal Server Error");
    }

    // Send the results as JSON
    res.json(results); // The results will be an array of objects with institute_name and Enrollment_key
  });
});
// get department names based on instiute name
app.get("/departments", (req, res) => {
  const instituteName = req.query.institute; // Get the institute name from query parameters

  // First, get the institute_id based on the institute_name
  const instituteQuery =
    "SELECT institute_id FROM Institute WHERE institute_name = ?";

  db.query(instituteQuery, [instituteName], (err, instituteResults) => {
    if (err) {
      console.error("Error fetching institute:", err);
      return res.status(500).send("Internal Server Error");
    }

    if (instituteResults.length === 0) {
      return res.status(404).send("Institute not found");
    }

    const instituteId = instituteResults[0].institute_id; // Get the institute_id

    // Now, fetch the departments for this institute_id
    const departmentQuery =
      "SELECT  dept_name FROM Department WHERE institute_id = ?";

    db.query(departmentQuery, [instituteId], (err, departmentResults) => {
      if (err) {
        console.error("Error fetching departments:", err);
        return res.status(500).send("Internal Server Error");
      }

      // Send the results as JSON
      res.json(departmentResults); // The results will be an array of objects with dept_id and dept_name
    });
  });
});

// // // get programs names based on department name
// // // Assuming you have already set up your Express app and database connection

// // // Endpoint to fetch programs based on department name
app.get("/programs", (req, res) => {
  const { department } = req.query; // Get department name from query parameters
  console.log("Deparrtment nme is", department);
  // Step 1: Find the dept_id based on the department name
  const getDeptIdQuery = "SELECT dept_id FROM department WHERE dept_name = ?";

  db.query(getDeptIdQuery, [department], (err, deptResults) => {
    if (err) {
      console.error("Error fetching dept_id:", err);
      return res.status(500).send("Internal Server Error");
    }

    // Check if the department exists
    if (deptResults.length === 0) {
      return res.status(404).send("Department not found");
    }

    const deptId = deptResults[0].dept_id; // Get dept_id
    console.log("the deptId is", deptId);
    // Step 2: Fetch program names based on the dept_id
    const getProgramsQuery = "SELECT prog_name FROM program WHERE dept_id = ?";

    db.query(getProgramsQuery, [deptId], (err, programResults) => {
      if (err) {
        console.error("Error fetching programs:", err);
        return res.status(500).send("Internal Server Error");
      }

      // Send the results as JSON
      res.json(programResults);
      console.log(programResults); // The results will be an array of program objects
    });
  });
});

app.post("/register/institute-student", async (req, res) => {
  const {
    username,
    first_name,
    last_name,
    email,
    mobile_number,
    gender,
    password,
    institute,
    usertype,
    department,
    program,
    current_semester,
    student_reg_id,
  } = req.body;

  console.log("Username:", username);
  console.log("First Name:", first_name);
  console.log("Last Name:", last_name);
  console.log("Email:", email);
  console.log("Mobile Number:", mobile_number);
  console.log("Gender:", gender);
  console.log("Password:", password); // Be careful with logging sensitive data
  console.log("Institute:", institute);
  console.log("Department:", department);
  console.log("Program:", program);
  console.log("Current Semester:", current_semester);
  console.log("Student Reg ID:", student_reg_id);

  const connection = await db.promise(); // Get a database connection

  try {
    await connection.beginTransaction(); // Start transaction

    // Step 1: Validate institute
    const [instituteResult] = await connection.query(
      "SELECT institute_id, institute_domain FROM institute WHERE institute_name = ?",
      [institute]
    );

    if (instituteResult.length === 0) {
      return res.status(404).send("Institute not found!");
    }

    const { institute_id, institute_domain } = instituteResult[0];

    // Step 2: Validate email against institute domain
    if (!email.includes(institute_domain)) {
      return res
        .status(400)
        .send("Please register with a verified institute email ID.");
    }

    // Step 3: Hash the password
    const hashedPassword = md5(password); // Replace with bcrypt for better security

    // Step 4: Insert user into the user table - no OTP needed
    const [userRows] = await connection.query(
      "INSERT INTO user (username, first_name, last_name, email_id, mobile_number, password, gender, type_id, institute_id, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        username,
        first_name,
        last_name,
        email,
        mobile_number,
        hashedPassword,
        gender,
        usertype,
        institute_id,
        1,
      ]
    );
    const user_id = userRows.insertId; // Get the inserted user's ID

    // Step 5: Validate program
    const [programRows] = await connection.query(
      "SELECT prog_id FROM program WHERE prog_name = ?",
      [program]
    );

    if (programRows.length === 0) {
      throw new Error("Program not found");
    }

    const program_id = programRows[0].prog_id;

    // Step 6: Insert student into the student table
    await connection.query(
      "INSERT INTO student (user_id, program_id, current_semester, stud_reg) VALUES (?, ?, ?, ?)",
      [user_id, program_id, current_semester, student_reg_id]
    );

    // Commit the transaction if all operations are successful
    await connection.commit();
    return res.status(200).send("Student registered successfully");
  } catch (error) {
    // Rollback the transaction in case of an error
    await connection.rollback();
    console.error("Error during registration:", error);
    res.status(500).json({ message: "Internal server error" });
  } finally {
    // Release the connection back to the pool
  }
});

// // endpoint to get the al course for that faculty
app.get("/courses", (req, res) => {
  const { userId } = req.query; // Extracting the `userId` from the query parameters
  //console.log("The user ID is:", userId);

  // First, query to get the Faculty_id using the provided user_id
  const getFacultyIdQuery = `
    SELECT Faculty_id 
    FROM faculty 
    WHERE User_id = ?;
  `;

  // Database connection (replace `db` with your actual database connection instance)
  db.query(getFacultyIdQuery, [userId], (error, results) => {
    if (error) {
      console.log("Database error while fetching Faculty_id:", error);
      return res
        .status(500)
        .json({ error: "Database error while fetching Faculty_id" });
    }

    if (results.length === 0) {
      return res
        .status(404)
        .json({ error: "No Faculty_id found for the provided user_id" });
    }

    const facultyId = results[0].Faculty_id;
    //console.log("The faculty ID is:", facultyId);

    // Now, query to get the courses using the Faculty_id
    const getCoursesQuery = `
      SELECT c.course_name,c.course_id
      FROM course c
      JOIN program p ON c.program_id = p.prog_id
      JOIN department d ON p.Depart_id = d.Dept_id
      JOIN faculty f ON d.Dept_id = f.Dept_id
      WHERE f.Faculty_id = ?;
    `;

    db.query(getCoursesQuery, [facultyId], (err, courses) => {
      if (err) {
        console.log("Database error while fetching courses:", err);
        return res
          .status(500)
          .json({ error: "Database error while fetching courses" });
      }

      // Log the courses to see what you got
      //console.log("The courses are:", courses);

      // If there are no courses, return an empty array
      if (courses.length === 0) {
        return res.json({ courses: [] });
      }

      // Send the courses in the response
      res.json({ courses });
    });
  });
});


app.post('/generate-html', async (req, res) => {
  const { options, year, user } = req.body;

  // Fetch the financial data based on the provided options and year
  const financialData = await getFinancialData(options, year); // Your logic to get financial data

  // Define the path where the HTML report will be saved
  const reportDirectory = path.join(__dirname, 'public', 'html_reports');
  const reportFilePath = path.join(reportDirectory, `financial_report_${year}.html`);

  // Create the directory if it doesn't exist
  if (!fs.existsSync(reportDirectory)) {
      fs.mkdirSync(reportDirectory, { recursive: true });
  }

  // Generate the HTML content
  const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Financial Report for Year: ${year}</title>
      </head>
      <body>
          <h1>Financial Report for Year: ${year}</h1>
          <table>
              <thead>
                  <tr>
                      <th>Description</th>
                      <th>Amount</th>
                  </tr>
              </thead>
              <tbody>
                  ${financialData.length > 0 ? financialData.map(data => `
                      <tr>
                          <td>${data.description || data.event_name || data.club_name || data.dept_name}</td>
                          <td>${data.amount || data.event_budget || data.total_budget}</td>
                      </tr>
                  `).join('') : `
                      <tr>
                          <td colspan="2">No data available for the selected options.</td>
                      </tr>
                  `}
              </tbody>
          </table>
      </body>
      </html>
  `;

  // Write the HTML content to the file
  fs.writeFile(reportFilePath, htmlContent, (err) => {
      if (err) {
          console.error('Error writing HTML file:', err);
          return res.status(500).json({ message: 'Error generating HTML report' });
      }
      // Send the path of the generated HTML file
      res.status(200).json({ filePath: `/html_reports/financial_report_${year}.html` });
  });
});




app.get("/api/user-photo/:userid", (req, res) => {
  const { userid } = req.params;
  // Step 1: Define the query to fetch the photo URL
  const queryFetchPhoto = "SELECT url FROM photourl WHERE user_id = ?";


  // Execute the query
  db.query(queryFetchPhoto, [userid], (err, results) => {
    if (err) {
      console.error("Error fetching photo:", err);
      return res.status(500).send("Error fetching photo.");
    }


    // Check if the query returned any results
    if (results.length === 0) {


      return res.status(404).send("Photo not found.");
    }


    // Extract the photo URL
    const photoURL = results[0].url;




    // Return the photo URL as JSON response
    res.status(200).json({ photoURL });
  });
});




app.use('/api', userRoutes);
// app.use('/api',updatepassRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// Use the profile routes
app.use('/api', profileRoutes);



const crypto = require("crypto"); 
app.post("/send-reset-link", (req, res) => {
  const { userId } = req.body;
  console.log("userId is ", userId);
  
  const query = "SELECT email_id FROM user WHERE user_id = ?";
  db.query(query, [userId], (err, results) => {
    if (err) return res.status(500).json({ error: "Database error." });

    if (results.length === 0) {
      return res.status(404).json({ error: "User not found." });
    }

    const email = results[0].email_id;
    console.log("email is ", results[0].email_id);
    
    // Generate a reset token (could be a JWT token or a random string)
    const resetToken = crypto.randomBytes(20).toString('hex');
    const tokenExpiry = new Date(Date.now() + 30 * 60 * 1000); // 30 min expiry
    
    // Store reset token in the database
    const tokenQuery = `UPDATE user 
      SET reset_token = ?, reset_token_expiry = ? 
      WHERE email_id = ?`;
      
    db.query(tokenQuery, [resetToken, tokenExpiry, email], (tokenErr) => {
      if (tokenErr)
        return res.status(500).json({ error: "Failed to store reset token." });

      // In a real implementation, you would send an email with a reset link
      // For now, just return the email for the frontend to show
      console.log("Reset token generated for:", email);
      res.status(200).json({ 
        email,
        message: "Password reset initiated. Check your email for reset instructions."
      });
    });
  });
});

app.post("/reset-password", (req, res) => {
  const { userId, newPassword } = req.body;

  const hashedPassword = crypto
    .createHash("md5")
    .update(newPassword)
    .digest("hex"); // Use bcrypt for production

  const query = "UPDATE user SET password = ? WHERE user_id = ?";
  db.query(query, [hashedPassword, userId], (err) => {
    if (err) return res.status(500).json({ error: "Database error." });

    res.status(200).json({ message: "Password updated successfully." });
  });
});




app.delete("/api/delete-account", async (req, res) => {
  const db1=db.promise();
  const userId = req.body.userId; // Assume user ID is sent in the body
  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  try {
    // Delete user from the database
    const result1 = await db1.query("DELETE FROM photourl WHERE user_id = ?", [userId]);
    const result = await db1.query("DELETE FROM user WHERE user_id = ?", [userId]);

    if (result.rowCount === 0 && result1.rowCount==0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "Account deleted successfully" });
  } catch (error) {
    console.error("Error deleting account:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});






//search papers
const axios = require('axios');
app.get('/api/search-papers', async (req, res) => {
  const { query } = req.query;


  if (!query) {
    return res.status(400).json({ error: 'Query is required' });
  }


  try {
    const response = await axios.get('https://serpapi.com/search.json', {
      params: {
        engine: 'google_scholar',
        q: query,
        api_key:'a69bd9a73d18c4b769c874f3b2a90bc38d06144d5cfe3e026782c4884e59ce8c',
      },
    });
    console.log(response.data); // Log response to debug


    const results = response.data.organic_results || [];
    console.log("results",results);
    if (results.length === 0) {
      return res.status(200).json({ message: 'No papers found for the given query.' });
    }


    const formattedResults = results.map((result, index) => ({
      id: index + 1,
      title: result.title || 'No title available',
      link: result.link || '#',
      snippet: result.snippet || 'No description available',
      publication_info: result.publication_info || 'No publication info available',
    }));


    res.json(formattedResults);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch papers' });
  }
});




//add research papers from the google scholar engine
app.post('/api/research/add', (req, res) => {
  const { title, description, status, publisher, link } = req.body;


  // SQL query to insert data into researchwork table
  const query = `
    INSERT INTO researchwork 
      (title, description, status, publisher, link, fund, funded_By, publication_date) 
    VALUES 
      (?, ?, ?, ?, ?, NULL, NULL, NULL)
  `;


  const values = [title, description, status, publisher, link];


  db.query(query, values, (err, result) => {
    if (err) {
      console.error('Error inserting data:', err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }


    console.log('Research paper added successfully');
    res.status(200).json({ success: true, message: 'Research paper added successfully' });
  });
});




