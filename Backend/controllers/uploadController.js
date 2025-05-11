const xlsx = require("xlsx");
const db = require("../db/dbConnection");

// Upload data from Excel to the database with course_id
const uploadData = (filePath, courseId) => {
  return new Promise((resolve, reject) => {
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    // Check if data is empty
    if (!data.length) {
      return reject("The uploaded file is empty or has invalid content.");
    }

    // Validate each row in the data
    const promises = data.map((row) => {
      return new Promise((innerResolve, innerReject) => {
        const { student_id, grade, result_status } = row;

        // Ensure required fields are present
        if (!student_id || !grade || !result_status) {
          console.error("Invalid row data:", row);
          return innerReject(
            new Error(
              "Invalid row: All fields (student_id, grade, result_status) are required."
            )
          );
        }

        const query = `
          INSERT INTO result (student_id, grade, result_status, course_id)
          VALUES (?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE
            grade = VALUES(grade),
            result_status = VALUES(result_status);
        `;

        db.query(query, [student_id, grade, result_status, courseId], (err) => {
          if (err) {
            console.error("Error inserting row:", err);
            innerReject(err);
          } else {
            innerResolve();
          }
        });
      });
    });

    // Execute all row insertions
    Promise.all(promises)
      .then(() => resolve())
      .catch((err) => reject(err));
  });
};

// Download data for a specific course_id
const downloadData = (res, courseId) => {
  const query =
    "SELECT student_id, grade, result_status FROM result WHERE course_id = ?";

  db.query(query, [courseId], (err, results) => {
    if (err) {
      console.error("Database Error:", err); // Log database error
      return res.status(500).send("Database error");
    }

    if (results.length === 0) {
      return res.status(404).send("No data found for the given course ID");
    }

    // console.log("Query Results:", results); // Log query results for debugging

    try {
      const worksheet = xlsx.utils.json_to_sheet(results);
      const workbook = xlsx.utils.book_new();
      xlsx.utils.book_append_sheet(workbook, worksheet, "Results");

      const filePath = "results_data.xlsx";
      xlsx.writeFile(workbook, filePath);
      res.download(filePath, (err) => {
        if (err) {
          console.error("File Download Error:", err); // Log file download error
          res.status(500).send("Error downloading file");
        }
      });
    } catch (error) {
      console.error("Excel Processing Error:", error); // Log Excel processing error
      res.status(500).send("Error generating Excel file");
    }
  });
};

module.exports = { uploadData, downloadData };
