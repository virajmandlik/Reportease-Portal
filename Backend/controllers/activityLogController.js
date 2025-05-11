const db = require('../db/dbConnection');


const getActivityLog = async (req, res) => {
    const { institute_id } = req.params;
    console.log('the insti id got is ',institute_id)
    const sql = `
        SELECT
    l.report_name,
    l.report_type,
    l.generated_at,
    u.first_name,
    u.last_name
    FROM report_logs l
    LEFT JOIN department d ON l.generated_by_user_id = d.coordinator_id
    INNER JOIN user u ON u.user_id = l.generated_by_user_id
    WHERE d.institute_id = ?
    ORDER BY l.generated_at DESC
    LIMIT 10;
    `;


    try {
        const logs = await new Promise((resolve, reject) => {
            db.query(sql, [institute_id], (err, results) => {
                if (err) return reject(err);
                resolve(results);
            });
        });


        // console.log('Fetched logs:', logs);


        res.status(200).json(logs);
    } catch (error) {
        console.error('Error fetching logs:', error);
        res.status(500).json({
            message: 'Error fetching logs',
            error: error.message
        });
    }
};






module.exports = { getActivityLog };




