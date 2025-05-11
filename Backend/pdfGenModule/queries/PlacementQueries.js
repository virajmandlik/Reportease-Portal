const db = require("../../db/dbConnection.js"); // Use the existing DB connection

const getPlacementData = async (options, year) => {
    let results = [];
    let params = [year];
    let uniqueRecords = new Set();
  
    for (const option of options) {
      let query;
  
      switch (option) {
        // Queries for the placements table
        case "1":
          query = `SELECT * FROM placements WHERE year = ?`;
          break;
        case "2":
          query = `SELECT DISTINCT * FROM placements WHERE year = ? AND recruiters IS NOT NULL`;
          break;
        case "3":
          query = `SELECT DISTINCT * FROM placements WHERE year = ?`;
          break;
        case "4":
          query = `SELECT AVG(package_in_lakh) AS average_package FROM placements WHERE year = ?`;
          break;
        case "5":
          query = `SELECT recruiters, COUNT(*) AS total FROM placements WHERE year = ? GROUP BY recruiters ORDER BY total DESC`;
          break;
        case "6":
          query = `SELECT year, COUNT(*) AS total_placements FROM placements GROUP BY year ORDER BY year`;
          break;
        case "7":
          query = `SELECT branch, COUNT(*) AS total FROM placements WHERE year = ? GROUP BY branch`;
          break;
        case "8":
          query = `SELECT student_name, branch, recruiters, package_in_lakh FROM placements WHERE year = ?`;
          break;
  
        // Queries for the career opportunities table
        case "9":
          // Skip this query
          continue;
        case "10":
          // Skip this query
          continue;
        case "11":
          // Skip this query
          continue;
        case "12":
          // Skip this query
          continue;
        case "13":
          // Skip this query
          continue;
        case "14":
          // Skip this query
          continue;
        case "15":
          // Skip this query
          continue;
        case "16":
          // Skip this query
          continue;
        default:
          throw new Error("Invalid option selected");
      }
  
      if (query) {
        const [rows] = await db.promise().query(query, params);
  
        rows.forEach((row) => {
          const recordKey = JSON.stringify(row);
          if (!uniqueRecords.has(recordKey)) {
            results.push(row);
            uniqueRecords.add(recordKey);
          }
        });
      }
    }
  
    // Filter out records with missing student_name or company_name
    results = results.filter((row) => {
      return (row.student_name && row.recruiters) || (row.organization && row.position);
    });
  
    return results;
  };
const getDepartmentByCoordinatorId= async (coordinatorId) => {
    console.log('the cord id isss',coordinatorId)
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

module.exports = { getPlacementData, getInstituteName,getDepartmentByCoordinatorId };