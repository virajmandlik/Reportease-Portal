const db = require("../../db/dbConnection.js");

const getClubData = async (options, year) => {
    let results = [];
    let params = [year];
    console.log('hey there i am in club queires ',options,year)
    for (const option of options) {
        let query;

        switch (option) {
            // Club Basic Information with Department
            case "1":
                query = `
                    SELECT 
                        c.club_id, 
                        c.club_name, 
                        c.club_type, 
                        u.first_name AS head_first_name,
                        u.last_name AS head_last_name,
                        d.dept_name
                    FROM club c
                    LEFT JOIN faculty f ON c.club_head = f.faculty_id
                    LEFT JOIN user u ON f.user_id = u.user_id
                    LEFT JOIN department d ON f.dept_id = d.dept_id
                    WHERE c.year = ?
                `;
                break;
            
            // Club Activities Count by Event Type
            case "2":
                query = `
                    SELECT 
                        c.club_name, 
                        c.club_type,
                        e.event_type, 
                        COUNT(e.event_id) AS total_events,
                        ROUND(SUM(e.event_budget), 2) AS total_budget
                    FROM club c
                    LEFT JOIN events e ON c.club_id = e.club_id
                    WHERE c.year = ?
                    GROUP BY c.club_name, c.club_type, e.event_type
                `;
                break;
            
            // Detailed Budget Analysis
            case "3":
                query = `
                    SELECT 
                        c.club_name, 
                        c.club_type,
                        COUNT(e.event_id) AS total_events,
                        ROUND(SUM(e.event_budget), 2) AS total_budget,
                        ROUND(AVG(e.event_budget), 2) AS average_event_budget,
                        ROUND(MIN(e.event_budget), 2) AS min_event_budget,
                        ROUND(MAX(e.event_budget), 2) AS max_event_budget
                    FROM club c
                    LEFT JOIN events e ON c.club_id = e.club_id
                    WHERE c.year = ?
                    GROUP BY c.club_id, c.club_name, c.club_type
                `;
                break;
            
            // Club Event Venues and Distribution
            case "4":
                query = `
                    SELECT 
                        c.club_name, 
                        e.event_venue,
                        COUNT(*) AS venue_usage_count,
                        GROUP_CONCAT(DISTINCT e.event_type) AS event_types
                    FROM club c
                    LEFT JOIN events e ON c.club_id = e.club_id
                    WHERE c.year = ? AND e.event_venue IS NOT NULL
                    GROUP BY c.club_name, e.event_venue
                `;
                break;
            
            // Club Membership Analysis
            case "5":
                query = `
                    SELECT 
                        c.club_name,
                        c.club_type,
                        COUNT(DISTINCT f.faculty_id) AS faculty_count,
                        COUNT(DISTINCT e.event_id) AS total_events,
                        ROUND(SUM(e.event_budget), 2) AS total_budget
                    FROM club c
                    LEFT JOIN faculty f ON c.club_head = f.faculty_id
                    LEFT JOIN events e ON c.club_id = e.club_id
                    WHERE c.year = ?
                    GROUP BY c.club_name, c.club_type
                `;
                break;
            
            // Detailed Club Event Information
            case "6":
                query = `
                    SELECT 
                        c.club_name,
                        c.club_type,
                        e.event_name,
                        e.event_type,
                        e.event_date,
                        e.event_venue,
                        ROUND(e.event_budget, 2) AS event_budget,
                        d.dept_name
                    FROM club c
                    LEFT JOIN events e ON c.club_id = e.club_id
                    LEFT JOIN department d ON e.dept_id = d.dept_id
                    WHERE c.year = ?
                    ORDER BY c.club_name, e.event_date
                `;
                break;
            
            // Comprehensive Club Performance Metrics
            case "7":
                query = `
                    SELECT 
                        c.club_name, 
                        c.club_type,
                        COUNT(DISTINCT e.event_id) AS total_events,
                        ROUND(SUM(e.event_budget), 2) AS total_budget,
                        ROUND(AVG(e.event_budget), 2) AS avg_event_budget,
                        MIN(e.event_date) AS earliest_event,
                        MAX(e.event_date) AS latest_event,
                        d.dept_name AS associated_department
                    FROM club c
                    LEFT JOIN events e ON c.club_id = e.club_id
                    LEFT JOIN faculty f ON c.club_head = f.faculty_id
                    LEFT JOIN department d ON f.dept_id = d.dept_id
                    WHERE c.year = ?
                    GROUP BY c.club_id, c.club_name, c.club_type, d.dept_name
                `;
                break;

            default:
                throw new Error("Invalid option selected");
        }

        const [rows] = await db.promise().query(query, params);
        results.push(...rows);
    }
    console.log('the results are:', results);
    return results;
};

const getClubFaculties = async (instituteId, year) => {
    const query = `
        SELECT 
            u.user_id,
            u.first_name, 
            u.last_name, 
            d.dept_name,
            f.faculty_id,
            c.club_name,
            c.club_type
        FROM user u
        JOIN faculty f ON u.user_id = f.user_id
        JOIN department d ON f.dept_id = d.dept_id
        LEFT JOIN club c ON f.faculty_id = c.club_head AND c.year = ?
        WHERE u.institute_id = ?
        ORDER BY u.first_name ASC
    `;

    const [rows] = await db.promise().query(query, [year, instituteId]);
    return rows;
};

const getClubsByDepartment = async (departmentId, year) => {
    const query = `
        SELECT 
            c.club_id,
            c.club_name,
            c.club_type,
            u.first_name AS head_first_name,
            u.last_name AS head_last_name
        FROM club c
        LEFT JOIN faculty f ON c.club_head = f.faculty_id
        LEFT JOIN user u ON f.user_id = u.user_id
        LEFT JOIN department d ON f.dept_id = d.dept_id
        WHERE d.dept_id = ? AND c.year = ?
    `;

    const [rows] = await db.promise().query(query, [departmentId, year]);
    return rows;
};

const getInstituteName = async (instituteId) => {
    const query = `SELECT institute_name FROM institute WHERE institute_id = ?`;
    const [rows] = await db.promise().query(query, [instituteId]);
    return rows;
};

const getClubEventSummary = async (clubId, year) => {
    const query = `
        SELECT 
            COUNT(event_id) AS total_events,
            ROUND(SUM(event_budget), 2) AS total_budget,
            ROUND(AVG(event_budget), 2) AS avg_budget,
            GROUP_CONCAT(DISTINCT event_type) AS event_types,
            MIN(event_date) AS first_event,
            MAX(event_date) AS last_event
        FROM events
        WHERE club_id = ? AND year = ?
    `;

    const [rows] = await db.promise().query(query, [clubId, year]);
    console.log('the rows are',rows)
    return rows;
};

const getDepartmentByCoordinatorId= async (coordinatorId) => {
    const query = `SELECT dept_name FROM department WHERE coordinator_id = ?`;
    const result = await db.promise().query(query, [coordinatorId]);
    console.log("Splendor is ...",result[0])
    return result[0];
  };

module.exports = { 
    getClubData, 
    getClubFaculties,
    getInstituteName,
    getClubsByDepartment,
    getClubEventSummary,
    getDepartmentByCoordinatorId
};