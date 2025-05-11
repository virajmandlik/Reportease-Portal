const db = require("../../db/dbConnection.js"); // Use the existing DB connection

const getInfrastructureData = async (options, year) => {
    let results = [];
    let params = [year];
    // console.log('hey\n i am in userQueries of infrastructure \n the options selected are ', options);
    // console.log('the selected year is ', year);
    
    for (const option of options) {
        let query;

        switch (option) {
            // Queries for the infrastructure table
            case "1":
                query = `SELECT * FROM infrastructure WHERE year = ?`;
                break;
            case "2":
                query = `SELECT * FROM infrastructure WHERE year = ? AND budget IS NOT NULL`;
                break;
            case "3":
                query = `SELECT AVG(budget) AS average_budget FROM infrastructure WHERE year = ?`;
                break;
            case "4":
                query = `SELECT dept_id, COUNT(*) AS total FROM infrastructure WHERE year = ? GROUP BY dept_id`;
                break;
            case "5":
                query = `SELECT description, budget FROM infrastructure WHERE year = ?`;
                break;
            default:
                throw new Error("Invalid option selected");
        }

        const [rows] = await db.promise().query(query, params);
        results.push(...rows); // Combine results from all queries
    }

    return results;
};
const getDepartmentByCoordinatorId= async (coordinatorId) => {
    console.log('the user id ',coordinatorId)
    const query = `SELECT dept_name FROM department WHERE coordinator_id = ?`;
    const result = await db.promise().query(query, [coordinatorId]);
    console.log("Splendor is ...",result[0])
    return result[0];
  };
const getInstituteName = async (instituteId) => {
    const query = `SELECT institute_name FROM institute WHERE institute_id = ?`;
    const [rows] = await db.promise().query(query, [instituteId]);
    return rows;
};

module.exports = { getInfrastructureData, getInstituteName,getDepartmentByCoordinatorId };