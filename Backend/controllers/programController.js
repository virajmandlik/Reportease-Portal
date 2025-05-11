const db = require('../db/dbConnection');


// Controller function to create a program
const createProgram = (req, res) => {
  const { username } = req.params;
  const { dept, program, duration, intake, semesters } = req.body;


  if (!dept || !program || !duration || !intake || !semesters) {
    return res
      .status(400)
      .send("All fields (dept, program_name, duration, intake, semester_count) are required.");
  }


  const queryFindUser = `SELECT dept_id FROM department WHERE dept_name = ? and institute_id = (select institute_id from user where username = ?)`;


  db.query(queryFindUser, [dept, username], (err, userResults) => {
    if (err) {
      console.error("Error finding user:", err);
      return res.status(500).send("Error retrieving user information.");
    }


    if (userResults.length === 0) {
      return res.status(404).send("User not found.");
    }


    const deptId = userResults[0].dept_id;
    console.log('deptId found',deptId);


    if (!deptId) {
      return res.status(404).send("User is not associated with any department.");
    }


    // Step 2: Insert the program into the `Program` table
    const queryInsertProgram = `
      INSERT INTO Program (prog_name, dept_id, duration, intake, semester_count)
      VALUES (?, ?, ?, ?, ?)`;


    db.query(
      queryInsertProgram,
      [program, deptId, duration, intake, semesters],
      (err, result) => {
        if (err) {
          console.error("Error inserting program:", err);
          return res.status(500).send("Error saving program.");
        }


        res.status(201).send({
          message: "Program created successfully.",
          programId: result.insertId,
        });
      }
    );
  });
};


module.exports = { createProgram };






