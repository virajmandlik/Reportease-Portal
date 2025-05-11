const db = require('../db/dbConnection');


// Controller function to create a program
const createInfrastructure = (req, res) => {
  const { institute_id } = req.params;
  const { dept, infraDesc, infraBudget, startDate, endDate } = req.body;


  if (!dept || !infraDesc || !infraBudget || !startDate) {
    return res
      .status(400)
      .send("All fields dept, description, budget, start date are required.");
  }


  const queryFindUser = `SELECT dept_id FROM department WHERE dept_name = ? and institute_id = ?`;


  db.query(queryFindUser, [dept, institute_id], (err, userResults) => {
    if (err) {
      console.error("Error finding user:", err);
      return res.status(500).send("Error retrieving user information.");
    }


    if (userResults.length === 0) {
      return res.status(404).send("User not found.");
    }


    const deptId = userResults[0].dept_id;
    // console.log('deptId found',deptId);


    if (!deptId) {
      return res.status(404).send("User is not associated with any department.");
    }


    // Step 2: Insert the program into the `Program` table
    const queryInsertProgram = `
      INSERT INTO Infrastructure (dept_id, description, budget, startdate, enddate)
      VALUES (?, ?, ?, ?, ?)`;


    db.query(
      queryInsertProgram,
      [deptId, infraDesc, infraBudget, startDate, endDate],
      (err, result) => {
        if (err) {
          console.error("Error inserting infrastructure:", err);
          return res.status(500).send("Error saving infrastructure.");
        }


        res.status(201).send({
          message: "Infrastructure created successfully.",
          programId: result.insertId,
        });
      }
    );
  });
};


module.exports = { createInfrastructure };





