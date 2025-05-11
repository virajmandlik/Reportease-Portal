const db = require('../db/dbConnection');

const getInstituteClubNames = async (req, res) => {
    const { institute_id } = req.params;
    console.log('the insti id got is ',institute_id)
    const sql = `
        SELECT 
            club_id, 
            club_name,
            club_type
        FROM club 
        WHERE institute_id = ? 
        ORDER BY club_name ASC
    `;

    try {
        const clubs = await new Promise((resolve, reject) => {
            db.query(sql, [institute_id], (err, results) => {
                if (err) return reject(err);
                resolve(results);
            });
        });

        console.log('Fetched Clubs:', clubs);

        res.status(200).json(clubs);
    } catch (error) {
        console.error('Error fetching club names:', error);
        res.status(500).json({ 
            message: 'Error fetching club names', 
            error: error.message 
        });
    }
};



module.exports = { getInstituteClubNames };