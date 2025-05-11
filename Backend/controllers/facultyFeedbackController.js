const db = require('../db/dbConnection');

// Controller function to submit faculty feedback
const submitFacultyFeedback = async (req, res) => {
    const { username, departmentName, feedback, rating } = req.body;

    // Validate input
    if (!username || !departmentName || !feedback || !rating) {
        return res.status(400).send("All fields username, departmentName, feedback, and rating are required.");
    }

    try {
        // Step 1: Get feedback_from_id from users table
        const [userResults] = await db.promise().query(`SELECT user_id FROM user WHERE username = ?`, [username]);
        if (userResults.length === 0) {
            return res.status(404).send("User  not found.");
        }

        const feedback_from_id = userResults[0].user_id;

        // Step 2: Get feedback_to_id from departments table
        const [deptResults] = await db.promise().query(`SELECT dept_id FROM department WHERE dept_name = ?`, [departmentName]);
        if (deptResults.length === 0) {
            return res.status(404).send("Department not found.");
        }

        const feedback_to_id = deptResults[0].dept_id;

        // Step 3: Check for existing feedback entry
        const [existingFeedback] = await db.promise().query(`
            SELECT * FROM feedback 
            WHERE feedback_from_id = ? AND feedback_to_id = ?`, 
            [feedback_from_id, feedback_to_id]);

        if (existingFeedback.length > 0) {
            return res.status(409).send("Feedback from this user to this department already exists.");
        }

        // Step 4: Insert feedback into feedback table
        const result = await db.promise().query(`
            INSERT INTO feedback (feedback_from_id, feedback_to_id, feedback_description, feedback_rating)
            VALUES (?, ?, ?, ?)`, [feedback_from_id, feedback_to_id, feedback, rating]);

        res.status(201).send({
            message: "Feedback submitted successfully.",
            feedback_id: result[0].insertId, // Access the first element of the result array for insertId
        });
    } catch (err) {
        console.error("Error processing feedback submission:", err);
        res.status(500).send("Error saving feedback.");
    }
};

module.exports = { submitFacultyFeedback };