const db = require("../../db/dbConnection.js");
const getStudentAndFacultyData = async (options, year) => {
    let results = [];
    let params = [year];
    console.log('i am in sutned fac Administration');
    console.log('options:',options,"year:",year);
    for (const option of options) {
        let query;

        switch (option) {
            // 1. Student Basic Information
            case "1":
                query = `
                    SELECT 
                        u.user_id,
                        u.first_name,
                        u.last_name,
                        u.email_id,
                        u.mobile_number,
                        u.gender,
                        d.dept_name,
                        st.current_semester,
                        st.stud_reg
                    FROM user u
                    LEFT JOIN student st ON u.user_id = st.user_id
                    LEFT JOIN program p ON st.program_id = p.prog_id
                    LEFT JOIN department d ON p.dept_id = d.dept_id
                    WHERE YEAR(u.created_at) = ?
                `;
                break;

            // 2. Academic Performance Analysis
            case "2":
                query = `
                    SELECT 
                        d.dept_name,
                        COUNT(DISTINCT st.student_id) AS total_students,
                        AVG(st.current_semester) AS average_semester,
                        COUNT(DISTINCT CASE WHEN st.current_semester > 0 THEN st.student_id END) AS active_students,
                        COUNT(DISTINCT CASE WHEN st.current_semester = 0 THEN st.student_id END) AS inactive_students
                    FROM department d
                    LEFT JOIN program p ON d.dept_id = p.dept_id
                    LEFT JOIN student st ON p.prog_id = st.program_id
                    WHERE st.year = ?
                    GROUP BY d.dept_name
                `;
                break;

            // 3. Achievements and Recognitions
            case "3":
                query = `
                    SELECT 
                        u.first_name,
                        u.last_name,
                        a.ach_title,
                        a.ach_type,
                        a.ach_date,
                        a.issuer,
                        a.score,
                        d.dept_name
                    FROM achievements a
                    JOIN user u ON a.user_id = u.user_id
                    LEFT JOIN student st ON u.user_id = st.user_id
                    LEFT JOIN program p ON st.program_id = p.prog_id
                    LEFT JOIN department d ON p.dept_id = d.dept_id
                    WHERE YEAR(a.ach_date) = ?
                    ORDER BY a.score DESC
                `;
                break;

            // 4. Research Work Analysis
            case "4":
                query = `
                    SELECT 
                        r.title,
                        r.description,
                        r.fund,
                        r.funded_by,
                        r.status,
                        r.publication_date,
                        r.publisher,
                        res.user_id,
                        u.first_name,
                        u.last_name,
                        d.dept_name
                    FROM researchwork r
                    LEFT JOIN researcher res ON r.research_id = res.research_id
                    LEFT JOIN user u ON res.user_id = u.user_id
                    LEFT JOIN faculty f ON u.user_id = f.user_id
                    LEFT JOIN department d ON f.dept_id = d.dept_id
                    WHERE YEAR(r.publication_date) = ?
                `;
                break;

            // 5. Faculty Detailed Information
            case "5":
                query = `
                    SELECT 
                        u.first_name,
                        u.last_name,
                        u.email_id,
                        u.mobile_number,
                        f.reg_no,
                        d.dept_name,
                        COUNT(DISTINCT rw.research_id) AS total_research_works,
                        COALESCE(SUM(rw.fund), 0) AS total_research_funding
                    FROM faculty f
                    JOIN user u ON f.user_id = u.user_id
                    JOIN department d ON f.dept_id = d.dept_id
                    LEFT JOIN researcher res ON u.user_id = res.user_id
                    LEFT JOIN researchwork rw ON res.research_id = rw.research_id
                    WHERE f.year = ?
                    GROUP BY 
                        u.user_id, 
                        u.first_name, 
                        u.last_name, 
                        u.email_id, 
                        u.mobile_number, 
                        f.reg_no, 
                        d.dept_name
                `;
                break;

            // 6. Department-wise Analysis
            case "6":
                query = `
                    SELECT 
                        d.dept_name,
                        COUNT(DISTINCT f.faculty_id) AS total_faculty,
                        COUNT(DISTINCT st.student_id) AS total_students,
                        COUNT(DISTINCT rw.research_id) AS total_research_works,
                        COALESCE(SUM(rw.fund), 0) AS total_research_funding
                    FROM department d
                    LEFT JOIN faculty f ON d.dept_id = f.dept_id
                    LEFT JOIN program p ON d.dept_id = p.dept_id
                    LEFT JOIN student st ON p.prog_id = st.program_id
                    LEFT JOIN user u ON (f.user_id = u.user_id OR st.user_id = u.user_id)
                    LEFT JOIN researcher res ON u.user_id = res.user_id
                    LEFT JOIN researchwork rw ON res.research_id = rw.research_id
                    WHERE f.year = ?
                    GROUP BY d.dept_name
                `;
                break;

            default:
                throw new Error("Invalid option selected");
        }

        try {
            const [rows] = await db.promise().query(query, params);
            results.push(...rows);
        } catch (error) {
            console.error(`Error executing query for option ${option}:`, error);
            console.error('Query:', query);
            console.error('Params:', params);
            throw error;
        }
    }
    console.log('the reuslts are in :-',results)
    return results;
};

// Additional utility functions
const getInstituteName = async (instituteId) => {
    const query = `SELECT institute_name FROM institute WHERE institute_id = ?`;
    const [rows] = await db.promise().query(query, [instituteId]);
    return rows;
};

const getAchievementTypes = async (year) => {
    const query = `
        SELECT 
            ach_type, 
            COUNT(*) as type_count,
            SUM(score) as total_score
        FROM achievements
        WHERE YEAR(ach_date) = ?
        GROUP BY ach_type
    `;
    const [rows] = await db.promise().query(query, [year]);
    return rows;
};

const getResearchFundingAnalysis = async (year) => {
    const query = `
        SELECT 
            funded_by,
            COUNT(*) as total_projects,
            SUM(fund) as total_funding,
            AVG(fund) as average_funding
        FROM researchwork
        WHERE YEAR(publication_date) = ?
        GROUP BY funded_by
    `;
    const [rows] = await db.promise().query(query, [year]);
    return rows;
};

const getDepartmentWiseStudentCount = async (instituteId) => {
    const query = `
        SELECT 
            d.dept_name AS dept_name, 
            COUNT(s.student_id) AS student_count
        FROM department d
        LEFT JOIN program p ON d.dept_id = p.dept_id
        LEFT JOIN student s ON s.program_id = p.prog_id
        WHERE d.institute_id = ?
        GROUP BY d.dept_name
        HAVING student _count > 0
    `;
    const [rows] = await db.promise().query(query, [instituteId]);
    return rows;
};
const getDepartmentByCoordinatorId= async (coordinatorId) => {
    const query = `SELECT dept_name FROM department WHERE coordinator_id = ?`;
    const result = await db.promise().query(query, [coordinatorId]);
    console.log("Splendor is ...",result[0])
    return result[0];
  };
module.exports = { 
    getStudentAndFacultyData, 
    getInstituteName,
    getAchievementTypes,
    getResearchFundingAnalysis,
    getDepartmentWiseStudentCount,
    getDepartmentByCoordinatorId
}; 