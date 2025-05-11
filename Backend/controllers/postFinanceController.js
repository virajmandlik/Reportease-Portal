const db = require('../db/dbConnection');


const createFinance = (req, res) => {
  const { institute_id } = req.params;
  const { finType, finTo, finDesc, amount,year } = req.body;
  // console.log('the feilds are',finType, finTo, finDesc, amount,year)

  if (!finTo || !finType || !finDesc || !amount || !institute_id || !year) {
    return res
      .status(400)
      .send("All fields type, finto, finDesc, amount,year  are required.");
  }


  let queryFindUser ="";
  let finTypeID = 0;
  if(finType === 'Department'){
    queryFindUser = `SELECT dept_id FROM department WHERE dept_name = ? and institute_id = ?`;
    finTypeID = 2;


    db.query(queryFindUser, [finTo, institute_id], (err, userResults) => {
      if (err) {
        console.error("Error finding user:", err);
        return res.status(500).send("Error retrieving user information.");
      }


      if (userResults.length === 0) {
        return res.status(404).send("User not found.");
      }


      const deptId = userResults[0].dept_id;


      if (!deptId) {
        return res.status(404).send("User is not associated with any department.");
      }


      const queryInsertProgram = `
        INSERT INTO Finance (institute_id, description, alloted_to, alloted_type, amount,year)
        VALUES (?, ?, ?, ?, ?,?)`;


      db.query(
        queryInsertProgram,
        [institute_id, finDesc, deptId, finTypeID, amount,year],
        (err, result) => {
          if (err) {
            console.error("Error inserting infrastructure:", err);
            return res.status(500).send("Error saving infrastructure.");
          }
          // console.log('the results after storing in deprart in foinance are',result)

          res.status(201).send({
            message: "Finance recorded successfully!.",
            programId: result.insertId,
          });
        }
      );
    });
  }
  else if(finType === 'Events'){
    queryFindUser = `SELECT e.event_id FROM events e inner join department d on e.dept_id = d.dept_id
        WHERE e.event_name = ? and d.institute_id = ?`;
    finTypeID = 3;


    db.query(queryFindUser, [finTo, institute_id], (err, userResults) => {
      if (err) {
        console.error("Error finding user:", err);
        return res.status(500).send("Error retrieving user information.");
      }


      if (userResults.length === 0) {
        return res.status(404).send("User not found.");
      }


      const eventId = userResults[0].event_id;


      if (!eventId) {
        return res.status(404).send("User is not associated with any department.");
      }


      const queryInsertProgram = `
        INSERT INTO Finance (institute_id, description, alloted_to, alloted_type, amount,year)
        VALUES (?, ?, ?, ?, ?,?)`;


      db.query(
        queryInsertProgram,
        [institute_id, finDesc, eventId, finTypeID, amount,year],
        (err, result) => {
          if (err) {
            console.error("Error inserting finance:", err);
            return res.status(500).send("Error saving finance.");
          }


          res.status(201).send({
            message: "Finance recorded successfully!.",
            programId: result.insertId,
          });
        }
      );
    });
  }
  else if(finType === 'Infrastructure'){
    queryFindUser = `SELECT i.infra_id FROM infrastructure i inner join department d on i.dept_id = d.dept_id
        WHERE i.description = ? and d.institute_id = ?`;
    finTypeID = 4;


    db.query(queryFindUser, [finTo, institute_id], (err, userResults) => {
      if (err) {
        console.error("Error finding user:", err);
        return res.status(500).send("Error retrieving user information.");
      }


      if (userResults.length === 0) {
        return res.status(404).send("User not found.");
      }


      const infraId = userResults[0].infra_id;


      if (!infraId) {
        return res.status(404).send("User is not associated with any department.");
      }


      const queryInsertProgram = `
        INSERT INTO Finance (institute_id, description, alloted_to, alloted_type, amount,year)
        VALUES (?, ?, ?, ?, ?,?)`;


      db.query(
        queryInsertProgram,
        [institute_id, finDesc, infraId, finTypeID, amount,year],
        (err, result) => {
          if (err) {
            console.error("Error inserting finance:", err);
            return res.status(500).send("Error saving finance.");
          }


          res.status(201).send({
            message: "Finance recorded successfully!.",
            programId: result.insertId,
          });
        }
      );
    });
  }
};


module.exports = { createFinance };





