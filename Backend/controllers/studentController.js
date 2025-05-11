const db = require("../db/dbConnection"); // Replace with your DB connection instance

// Fetch courses for a student based on userId
const getStudentCourses = (req, res) => {
  const { userId } = req.query;

  if (!userId || isNaN(Number(userId))) {
    return res.status(400).json({ error: "Invalid or missing userId" });
  }

  // Query to fetch student_id based on userId
  const getStudentIdQuery = `
    SELECT student_id
    FROM student
    WHERE user_id = ?;
  `;

  db.query(getStudentIdQuery, [userId], (error, results) => {
    if (error) {
      console.error("Error fetching student_id:", error);
      return res.status(500).json({ error: "Error fetching student_id" });
    }

    if (results.length === 0) {
      return res
        .status(404)
        .json({ error: "Student not found for the provided user_id" });
    }

    const studentId = results[0].student_id;

    // Query to fetch program_id based on student_id
    const getProgramIdQuery = `
      SELECT program_id
      FROM student
      WHERE user_id = ?;
    `;

    db.query(getProgramIdQuery, [userId], (err, programResults) => {
      if (err) {
        console.error("Error fetching program_id:", err);
        return res.status(500).json({ error: "Error fetching program_id" });
      }

      if (programResults.length === 0) {
        return res
          .status(404)
          .json({ error: "Program not found for the given user_id" });
      }

      const programId = programResults[0].program_id;

      // Combined query to fetch all courses in the student's program and show if the student is enrolled or not
      const getCoursesWithEnrollmentQuery = `
        SELECT 
          c.course_id,
          c.course_name,
          CASE
            WHEN ce.student_id IS NOT NULL THEN true
            ELSE false
          END AS is_enrolled
        FROM course c
        LEFT JOIN course_enrollment ce
          ON c.course_id = ce.course_id AND ce.student_id = ?
        WHERE c.program_id = ?
      `;

      // Query to fetch the courses with the enrollment status
      db.query(
        getCoursesWithEnrollmentQuery,
        [studentId, programId],
        (err, courses) => {
          if (err) {
            console.error(
              "Error fetching courses with enrollment status:",
              err
            );
            return res
              .status(500)
              .json({ error: "Error fetching courses with enrollment status" });
          }

          res.json({ courses: courses.length ? courses : [] });
        }
      );
    });
  });
};

module.exports = { getStudentCourses };
