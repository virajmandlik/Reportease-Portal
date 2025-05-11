const xlsx = require("xlsx");
const db = require("../db/dbConnection");

// Handle update or insert data for a specific course_id
const handleUpdate = (data, courseId) => {
  // console.log("courseId is: ", courseId);
  return new Promise((resolve, reject) => {
    data.forEach((row) => {
      const { student_id, grade, result_status } = row;

      const checkQuery =
        "SELECT * FROM result WHERE student_id = ? AND course_id = ?";
      db.query(checkQuery, [student_id, courseId], (err, results) => {
        if (err) return reject(err);

        if (results.length > 0) {
          const updateQuery =
            "UPDATE result SET grade = ?, result_status = ? WHERE student_id = ? AND course_id = ?";
          db.query(
            updateQuery,
            [grade, result_status, student_id, courseId],
            (err) => {
              if (err) return reject(err);
            }
          );
        } else {
          const insertQuery =
            "INSERT INTO result ( student_id, grade, result_status,course_id) VALUES (?, ?, ?, ?)";
          db.query(
            insertQuery,
            [student_id, grade, result_status, courseId],
            (err) => {
              if (err) return reject(err);
            }
          );
        }
      });
    });
    resolve();
  });
};

// Function to generate and save the Excel template
const generateTemplate = (filePath) => {
  // console.log("Generating template at:", filePath);

  try {
    // Define column headers and a sample row to guide users
    const headers = [
      {
        student_id: "Example: 12345",
        grade: "Example: A",
        result_status: "Example: Pass",
      },
    ];

    // Create a worksheet and workbook
    const worksheet = xlsx.utils.json_to_sheet(headers);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, "Template");

    // Write the workbook to the specified file path
    xlsx.writeFile(workbook, filePath);
  } catch (error) {
    console.error("Error generating template:", error);
    throw new Error("Template generation failed");
  }
};

module.exports = { handleUpdate, generateTemplate };
