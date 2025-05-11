const db = require("../../db/dbConnection.js");

const getEventData = async (options, year) => {
    let results = [];
    let params = [year];
    
    for (const option of options) {
        let query;

        switch (option) {
            case "1":
                query = `SELECT * FROM events WHERE year = ?`;
                break;
            case "2":
                query = `SELECT e.*, d.dept_name 
                         FROM events e
                         LEFT JOIN department d ON e.dept_id = d.dept_id
                         WHERE e.year = ?`;
                break;
            case "3":
                query = `SELECT event_type, COUNT(*) as event_count 
                         FROM events 
                         WHERE year = ? 
                         GROUP BY event_type`;
                break;
            case "4":
                query = `SELECT event_venue, COUNT(*) as venue_usage 
                         FROM events 
                         WHERE year = ? AND event_venue IS NOT NULL
                         GROUP BY event_venue 
                         ORDER BY venue_usage DESC`;
                break;
            case "5":
                query = `SELECT SUM(event_budget) as total_budget 
                         FROM events 
                         WHERE year = ?`;
                break;
            case "6":
                query = `SELECT d.dept_name, COUNT(e.event_id) as event_count
                         FROM events e
                         LEFT JOIN department d ON e.dept_id = d.dept_id
                         WHERE e.year = ?
                         GROUP BY d.dept_name
                         ORDER BY event_count DESC`;
                break;
            case "7":
                query = `SELECT * FROM events 
                         WHERE event_type = 'Technical' AND year = ?`;
                break;
            case "8":
                query = `SELECT * FROM events 
                         WHERE event_type = 'Cultural' AND year = ?`;
                break;
            case "9":
                query = `SELECT 
                            MONTH(event_date) as month, 
                            COUNT(*) as event_count 
                         FROM events 
                         WHERE year = ?
                         GROUP BY MONTH(event_date)
                         ORDER BY month`;
                break;
            case "10":
                query = `SELECT 
                            e.*, 
                            c.club_name
                         FROM events e
                         LEFT JOIN club c ON e.club_id = c.club_id
                         WHERE e.year = ?`;
                break;
            case "11":
                query = `SELECT 
                            event_type, 
                            AVG(event_budget) as avg_budget 
                         FROM events 
                         WHERE year = ?
                         GROUP BY event_type`;
                break;
            case "12":
                query = `SELECT 
                            CASE 
                                WHEN event_budget = 0 THEN 'No Budget'
                                WHEN event_budget > 0 AND event_budget <= 1000 THEN 'Low Budget'
                                WHEN event_budget > 1000 AND event_budget <= 5000 THEN 'Medium Budget'
                                ELSE 'High Budget'
                            END as budget_category,
                            COUNT(*) as event_count
                         FROM events 
                         WHERE year = ?
                         GROUP BY budget_category
                         ORDER BY event_count DESC`;
                break;
            default:
                throw new Error("Invalid option selected");
        }

        const [rows] = await db.promise().query(query, params);
        results.push(...rows);
    }

    return results;
};

const getInstituteName = async (instituteId) => {
    const query = `SELECT institute_name FROM institute WHERE institute_id = ?`;
    const [rows] = await db.promise().query(query, [instituteId]);
    return rows;
};
const getDepartmentByCoordinatorId= async (coordinatorId) => {
    const query = `SELECT dept_name FROM department WHERE coordinator_id = ?`;
    const result = await db.promise().query(query, [coordinatorId]);
    console.log("Splendor is ...",result[0])
    return result[0];
  };
// New methods to enhance event data retrieval
const getEventDetails = async (instituteId, options = {}) => {
    const {
        year,
        eventType,
        minBudget,
        maxBudget,
        startDate,
        endDate,
        departmentId,
        clubId
    } = options;

    let query = `
        SELECT e.*, 
               d.dept_name, 
               c.club_name, 
               i.institute_name
        FROM events e
        LEFT JOIN department d ON e.dept_id = d.dept_id
        LEFT JOIN club c ON e.club_id = c.club_id
        LEFT JOIN institute i ON e.institute_id = i.institute_id
        WHERE e.institute_id = ?
    `;

    const params = [instituteId];

    if (year) {
        query += ` AND e.year = ?`;
        params.push(year);
    }

    if (eventType) {
        query += ` AND e.event_type = ?`;
        params.push(eventType);
    }

    if (minBudget !== undefined) {
        query += ` AND e.event_budget >= ?`;
        params.push(minBudget);
    }

    if (maxBudget !== undefined) {
        query += ` AND e.event_budget <= ?`;
        params.push(maxBudget);
    }

    if (startDate) {
        query += ` AND e.event_date >= ?`;
        params.push(startDate);
    }

    if (endDate) {
        query += ` AND e.event_date <= ?`;
        params.push(endDate);
    }

    if (departmentId) {
        query += ` AND e.dept_id = ?`;
        params.push(departmentId);
    }

    if (clubId) {
        query += ` AND e.club_id = ?`;
        params.push(clubId);
    }

    const [rows] = await db.promise().query(query, params);
    return rows;
};

const generateEventReport = async (instituteId, year) => {
    const reportQueries = {
        totalEvents: `
            SELECT COUNT(*) as total_events 
            FROM events 
            WHERE institute_id = ? AND year = ?
        `,
        eventsByType: `
            SELECT event_type, COUNT(*) as type_count 
            FROM events 
            WHERE institute_id = ? AND year = ? 
            GROUP BY event_type
        `,
        budgetSummary: `
            SELECT 
                MIN(event_budget) as min_budget,
                MAX(event_budget) as max_budget,
                AVG(event_budget) as avg_budget,
                SUM(event_budget) as total_budget
            FROM events 
            WHERE institute_id = ? AND year = ?
        `,
        topDepartments: `
            SELECT 
                d.dept_name, 
                COUNT(e.event_id) as event_count
            FROM events e
            JOIN department d ON e.dept_id = d.dept_id
            WHERE e.institute_id = ? AND e.year = ?
            GROUP BY d.dept_name
            ORDER BY event_count DESC
            LIMIT 5
        `
    };

    const report = {};

    for (const [key, query] of Object.entries(reportQueries)) {
        const [rows] = await db.promise().query(query, [instituteId, year]);
        report[key] = rows;
    }
    return report;
};

module.exports = { 
    getEventData, 
    getInstituteName,
    getEventDetails,
    generateEventReport,
    getDepartmentByCoordinatorId
};