const fs = require("fs");
const path = require("path");
const xlsx = require("xlsx");
const db = require("../db/dbConnection"); // Adjust the path as necessary

// Generate Course Template
const generateCourseTemplate = (filePath) => {
  try {
    const headers = [
      {
        dept_name: "", // Department Name
        course_name: "", // Course Name
        program_name: "", // Program Name
        semester: "", // Semester
      },
    ];
    const worksheet = xlsx.utils.json_to_sheet(headers);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, "Template");
    xlsx.writeFile(workbook, filePath);
  } catch (error) {
    console.error("Error generating template:", error);
    throw new Error("Template generation failed");
  }
};

// Controller to handle template download
const downloadCourseTemplate = (req, res) => {
  try {
    const filePath = path.join(__dirname, "../course_template.xlsx");
    generateCourseTemplate(filePath);
    res.download(filePath, "course_template.xlsx", (err) => {
      if (err) {
        console.error("Error sending file:", err);
        res.status(500).send("Error occurred during file download");
      }
    });
  } catch (error) {
    res.status(500).send("Error generating the template");
  }
};

// Upload data from Excel to database
const uploadCourseData = (filePath) => {
  return new Promise((resolve, reject) => {
    try {
      const workbook = xlsx.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

      if (!data.length) {
        fs.unlinkSync(filePath);
        return reject(
          new Error("The uploaded file is empty or has invalid content.")
        );
      }

      const promises = data.map((row) => {
        return new Promise((innerResolve, innerReject) => {
          const { dept_name, course_name, program_name, semester } = row;

          if (!dept_name || !course_name || !program_name || !semester) {
            console.error("Invalid row data:", row);
            return innerReject(
              new Error("Invalid row: All fields are required.")
            );
          }

          // Find the program_id using the program_name and dept_name
          const getProgramIdQuery = `
            SELECT prog_id 
            FROM program 
            WHERE dept_id = (
              SELECT dept_id 
              FROM department 
              WHERE dept_name = ?
            ) AND prog_name = ?;
          `;

          db.query(
            getProgramIdQuery,
            [dept_name, program_name],
            (err, result) => {
              if (err) {
                console.error("Error finding program:", err);
                return innerReject(err);
              }

              if (result.length === 0) {
                console.error("Program not found for:", program_name);
                return innerReject(
                  new Error(`Program not found for: ${program_name}`)
                );
              }

              const program_id = result[0].prog_id;

              // Now insert the course record
              const insertCourseQuery = `
              INSERT INTO course (course_id, course_name, program_id, semester)
              VALUES (NULL, ?, ?, ?);
            `;
              db.query(
                insertCourseQuery,
                [course_name, program_id, semester],
                (err) => {
                  if (err) {
                    console.error("Error inserting course:", err);
                    return innerReject(err);
                  }
                  innerResolve();
                }
              );
            }
          );
        });
      });

      Promise.all(promises)
        .then(() => {
          fs.unlinkSync(filePath);
          resolve();
        })
        .catch((err) => {
          fs.unlinkSync(filePath);
          reject(err);
        });
    } catch (err) {
      fs.unlinkSync(filePath);
      reject(err);
    }
  });
};

// Controller for data upload
const handleCourseUpload = (req, res) => {
  uploadCourseData(req.file.path)
    .then(() => res.send("Course data uploaded and stored in the database"))
    .catch((err) => {
      console.error("Error uploading course data:", err);
      res.status(500).send("Error uploading course data");
    });
};

// Download existing course data
const downloadCourseData = (req, res) => {
  const query = `
    SELECT c.course_name, p.prog_name, d.dept_name, c.semester
    FROM course c
 JOIN program p ON c.program_id = p.prog_id
    JOIN department d ON p.dept_id = d.dept_id
  `;
  db.query(query, (err, results) => {
    if (err) {
      console.error("Database Error:", err);
      return res.status(500).send("Database error");
    }
    if (!results.length) {
      return res.status(404).send("No data found");
    }
    try {
      const worksheet = xlsx.utils.json_to_sheet(results);
      const workbook = xlsx.utils.book_new();
      xlsx.utils.book_append_sheet(workbook, worksheet, "Courses");
      const tempFilePath = path.join(__dirname, "../Courses.xlsx");
      xlsx.writeFile(workbook, tempFilePath);
      res.download(tempFilePath, "Course_Data.xlsx", (err) => {
        if (err) {
          console.error("File Download Error:", err);
          res.status(500).send("Error downloading file");
        }
        fs.unlinkSync(tempFilePath);
      });
    } catch (error) {
      console.error("Excel Processing Error:", error);
      res.status(500).send("Error generating Excel file");
    }
  });
};

// Export the functions
module.exports = {
  downloadCourseTemplate,
  handleCourseUpload,
  downloadCourseData,
};
