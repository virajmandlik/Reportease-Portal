const db = require("../db/dbConnection"); // Replace with your DB connection instance

// Enroll a student in courses
const enrollStudent = (req, res) => {
  const { userId, courses } = req.body;

  if (!userId || !Array.isArray(courses) || courses.length === 0) {
    return res.status(400).json({ error: "Invalid input data" });
  }

  const query01 = `
    SELECT student_id
    FROM student
    WHERE user_id = ?;
  `;

  db.query(query01, [userId], (err, results) => {
    if (err) {
      console.error("Error fetching student_id:", err.message);
      return res.status(500).json({ error: "Failed to fetch student_id" });
    }

    if (results.length === 0) {
      return res
        .status(404)
        .json({ error: "Student not found for the given userId" });
    }

    const studentId = results[0].student_id;
    const enrollments = courses.map((courseId) => [courseId, studentId]);

    // Step 1: Check for existing enrollments
    const checkEnrollmentsQuery = `
      SELECT course_id FROM course_enrollment 
      WHERE student_id = ? AND course_id IN (?)
    `;

    db.query(checkEnrollmentsQuery, [studentId, courses], (err, existingEnrollments) => {
      if (err) {
        console.error("Error checking existing enrollments:", err.message);
        return res.status(500).json({ error: "Failed to check existing enrollments" });
      }

      // Collect existing course IDs
      const existingCourseIds = existingEnrollments.map(enrollment => enrollment.course_id);
      const newEnrollments = enrollments.filter(enrollment => !existingCourseIds.includes(enrollment[0]));

      if (newEnrollments.length === 0) {
        return res.status(409).json({ message: "Student is already enrolled in these courses." });
      }

      const query = `
        INSERT INTO course_enrollment (course_id, student_id)
        VALUES ?
      `;

      db.query(query, [newEnrollments], (err, result) => {
        if (err) {
          console.error("Error inserting enrollment data:", err.message);
          return res.status(500).json({ error: "Failed to enroll courses" });
        }

        res.status(200).json({
          message: "Enrollment successful",
          enrollments: result.affectedRows,
        });
      });
    });
  });
};
module.exports = { enrollStudent };
