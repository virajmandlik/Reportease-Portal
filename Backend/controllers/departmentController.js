const db = require('../db/dbConnection');
const md5 = require('md5');


// Controller function to create a department
const createDepartment = async (req, res) => {
  const { institute_id, department, deptType, coordData } = req.body;


  // Start a transaction
  db.beginTransaction(async (err) => {
    if (err) return res.status(500).json({ error: err.message });


    try {
      // Hash the password for the new user
      const hashedPassword = md5(coordData.password);
      const userSql = `
        INSERT INTO user
        (first_name, last_name, email_id, username, mobile_number, password, gender, type_id, institute_id, is_active)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      const userValues = [
        coordData.first_name,
        coordData.last_name,
        coordData.email,
        coordData.username,
        coordData.phone_number,
        hashedPassword,
        coordData.gender,
        2, // Assuming this is the type_id for the coordinator
        institute_id,
        1  // Assuming this is is_active status
      ];


      // Insert the user and get the user_id
      const userResult = await new Promise((resolve, reject) => {
        db.query(userSql, userValues, (err, result) => {
          if (err) return reject(err);
          resolve(result);
        });
      });


      // Insert the department with the coordinator_id
      const deptSql = `
        INSERT INTO department
        (dept_name, institute_id, dept_type, coordinator_id)
        VALUES (?, ?, ?, ?)
      `;
      const deptValues = [department, institute_id, deptType, userResult.insertId];


      const deptResult = await new Promise((resolve, reject) => {
        db.query(deptSql, deptValues, (err, result) => {
          if (err) return reject(err);
          resolve(result);
        });
      });


      db.commit((err) => {
        if (err) {
          return db.rollback(() => {
            res.status(500).json({ error: 'Transaction commit failed' });
          });
        }
        res.status(201).json({
          message: 'Department and coordinator created successfully',
          deptId: deptResult.insertId
        });
      });
    } catch (error) {
      db.rollback(() => {
        res.status(500).json({ error: error.message });
      });
    }
  });
};


module.exports = { createDepartment };



