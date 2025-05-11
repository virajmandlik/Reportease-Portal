const db = require("../db/dbConnection"); // Adjust the path as necessary

// Controller function to add a course
const addCourse = (req, res) => {
  const { instituteId, departments, course_name, program_name, semester } =
    req.body;

  // Validate input
  if (!departments || !course_name || !program_name || !semester) {
    return res.status(400).json({ error: "All fields are required" });
  }

  // Step 1: Get the program_id
  const getProgramIdQuery = `
    SELECT prog_id 
    FROM program 
    WHERE dept_id = (
      SELECT dept_id 
      FROM department 
      WHERE dept_name = ? AND institute_id = ?
    ) AND prog_name = ?;
  `;

  db.query(
    getProgramIdQuery,
    [departments, instituteId, program_name],
    (err, results) => {
      if (err) {
        console.error("Error fetching program ID:", err);
        return res
          .status(500)
          .json({ error: "Error fetching program ID: " + err.message });
      }

      if (results.length === 0) {
        return res.status(404).json({
          error:
            "Program not found for the specified department, institute, and program name",
        });
      }

      const program_id = results[0].prog_id;

      // Step 2: Insert the course into the course table
      const insertCourseQuery = `
      INSERT INTO course (course_id, course_name, program_id, semester)
      VALUES (NULL, ?, ?, ?);
    `;

      db.query(
        insertCourseQuery,
        [course_name, program_id, semester],
        (err, result) => {
          if (err) {
            console.error("Error adding course:", err);
            return res
              .status(500)
              .json({ error: "Error adding course: " + err.message });
          }

          res.status(201).json({ message: "Course added successfully" });
        }
      );
    }
  );
};

module.exports = { addCourse };
