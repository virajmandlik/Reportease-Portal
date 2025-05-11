const { configDotenv } = require("dotenv");
const db = require("../../db/dbConnection.js"); // Use the existing DB connection

// Function to get student data for a specific year
const getStudentData = async (year) => {
    const query = `SELECT student_id, user_id, program_id, current_semester, stud_reg, year 
                   FROM student 
                   WHERE year = ?`;
    const [rows] = await db.promise().query(query, [year]);
    return rows;
};

// Function to get faculty data for a specific year
const getFacultyData = async (year) => {
    const query = `SELECT faculty_id, user_id, reg_no, dept_id, year 
                   FROM faculty 
                   WHERE year = ?`;
    const [rows] = await db.promise().query(query, [year]);
    return rows;
};

// Function to get program data for a specific year
const getProgramData = async (year) => {
    const query = `SELECT prog_id, prog_name, dept_id, duration, intake, semester_count, year 
                   FROM program 
                   WHERE year = ?`;
    const [rows] = await db.promise().query(query, [year]);
    return rows;
};

// Function to get result data for a specific year
const getResultData = async (year) => {
    const query = `SELECT result_id, enrollment_id, grade, res_status, year 
                   FROM result 
                   WHERE year = ?`;
    const [rows] = await db.promise().query(query, [year]);
    return rows;
};

// Function to get the institute name based on institute_id
const getInstituteName = async (instituteId) => {
    const query = `SELECT institute_name FROM institute WHERE institute_id = ?`;
    const [rows] = await db.promise().query(query, [instituteId]);
    return rows;
};

const getDepartmentByCoordinatorId= async (coordinatorId) => {
    console.log('the cord id got is',coordinatorId)
    const query = `SELECT dept_name FROM department WHERE coordinator_id = ?`;
    const result = await db.promise().query(query, [coordinatorId]);
    console.log("Splendor is ...",result[0])
    return result[0];
  };


// Export the functions
module.exports = { getStudentData, getFacultyData, getProgramData, getResultData, getInstituteName, getDepartmentByCoordinatorId };