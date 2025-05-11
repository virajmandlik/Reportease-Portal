const db = require("../../db/dbConnection.js"); // Use the existing DB connection

const getFinancialData = async (options, year) => {
    let results = [];
    let params = [year];
    // console.log('hey\n i am in userQueries \n the options selected are ', options);
  
    for (const option of options) {
      let query;
  
      switch (option) {
        case "1":
          query = `SELECT * FROM infrastructure WHERE year = ?`;
          break;
        case "2":
          query = `SELECT * FROM events WHERE year = ?`;
          break;
        case "3":
          query = `SELECT * FROM finance WHERE year = ?`;
          break;
        case "4":
          query = `SELECT * FROM club WHERE year = ?`;
          break;
        case "5":
          query = `SELECT club.club_name, SUM(finance.amount) as total_budget 
                    FROM finance 
                    JOIN club ON finance.institute_id = club.institute_id 
                    WHERE finance.year = ? 
                    GROUP BY club.club_name`;
          break;
        case "6":
          query = `SELECT event.event_name, event.event_budget 
                    FROM events AS event 
                    WHERE event.year = ?`;
          break;
        case "7":
          query = `SELECT department.dept_name, SUM(finance.amount) as total_budget 
                    FROM finance 
                    JOIN department ON finance.institute_id = department.institute_id 
                    WHERE finance.year = ? 
                    GROUP BY department.dept_name`;
          break;
        default:
          throw new Error("Invalid option selected");
      }
  
      const [rows] = await db.promise().query(query, params);
      results.push(...rows); // Combine results from all queries
    }
  
    return results;
};

const getInstituteName = async (instituteId) => {
    const query = `SELECT institute_name FROM institute WHERE institute_id = ?`; // Adjust the query based on your database schema
    const [rows] = await db.promise().query(query, [instituteId]);
    return rows;
  };
  const getDepartmentByCoordinatorId= async (coordinatorId) => {
    const query = `SELECT dept_name FROM department WHERE coordinator_id = ?`;
    const result = await db.promise().query(query, [coordinatorId]);
    console.log("Splendor is ...",result[0])
    return result[0];
  };
  module.exports = { getFinancialData, getInstituteName,getDepartmentByCoordinatorId };