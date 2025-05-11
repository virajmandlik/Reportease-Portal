const db = require('../db/dbConnection');

// Controller function to add a placement
const addPlacement = async (req, res) => {
    const { student_reg, student_name, branch, recruiters, package_in_lakh } = req.body;
    console.log('Received data:', student_reg, student_name, branch, recruiters, package_in_lakh);

    // Start a transaction
    db.beginTransaction(async (err) => {
        if (err) return res.status(500).json({ error: err.message });

        try {
            // Step 1: Find the student_id using the registration number
            const findStudentSql = `SELECT student_id FROM student WHERE stud_reg = ?`;
            const studentResult = await new Promise((resolve, reject) => {
                db.query(findStudentSql, [student_reg], (err, result) => {
                    if (err) return reject(err);
                    resolve(result);
                });
            });

            if (studentResult.length === 0) {
                return res.status(404).json({ message: 'Student not found' });
            }

            const student_id = studentResult[0].student_id;

            // Step 2: Check if the placement record already exists for the student_id
            const checkPlacementSql = `SELECT * FROM placements WHERE student_id = ?`;
            const existingPlacement = await new Promise((resolve, reject) => {
                db.query(checkPlacementSql, [student_id], (err, result) => {
                    if (err) return reject(err);
                    resolve(result);
                });
            });

            if (existingPlacement.length > 0) {
                return res.status(409).json({ message: 'Duplicate entry: Placement already exists for this student.' });
            }

            // Step 3: Insert the placement record
            const insertPlacementSql = `
                INSERT INTO placements (student_id, student_name, branch, recruiters, package_in_lakh)
                VALUES (?, ?, ?, ?, ?)
            `;
            const placementValues = [student_id, student_name, branch, recruiters, package_in_lakh];

            await new Promise((resolve, reject) => {
                db.query(insertPlacementSql, placementValues, (err, result) => {
                    if (err) return reject(err);
                    resolve(result);
                });
            });

            // Commit the transaction
            db.commit((err) => {
                if (err) {
                    return db.rollback(() => {
                        res.status(500).json({ error: 'Transaction commit failed' });
                    });
                }
                res.status(201).json({ message: 'Placement added successfully' });
            });
        } catch (error) {
            db.rollback(() => {
                res.status(500).json({ error: error.message });
            });
        }
    });
};          

module.exports = { addPlacement };