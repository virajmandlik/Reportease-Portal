const fs = require("fs");
const path = require("path");
const xlsx = require("xlsx");
const db = require("../db/dbConnection");

// Generate Program Template
const generateProgramTemplate = (filePath) => {
  try {
    const headers = [
      {
        dept: "", // Department
        program: "", // Program Name
        duration: "", // Duration
        intake: "", // Intake
        semesters: "", // Semester Count
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

// Upload data from Excel to database
const uploadProgramData = (filePath, username) => {
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
          const { dept, program, duration, intake, semesters } = row;

          if (!dept || !program || !duration || !intake || !semesters) {
            return innerReject(
              new Error("Invalid row: All fields are required.")
            );
          }

          const queryFindUser = `SELECT dept_id FROM department WHERE dept_name = ? and institute_id = (select institute_id from user where username = ?)`;
          db.query(queryFindUser, [dept, username], (err, userResults) => {
            if (err) {
              return innerReject(err);
            }

            if (userResults.length === 0) {
              return innerReject(
                new Error("Department not found for the user.")
              );
            }

            const deptId = userResults[0].dept_id;

            const queryInsertProgram = `
              INSERT INTO Program (prog_name, dept_id, duration, intake, semester_count)
              VALUES (?, ?, ?, ?, ?)`;
            db.query(
              queryInsertProgram,
              [program, deptId, duration, intake, semesters],
              (err) => {
                if (err) {
                  return innerReject(err);
                }
                innerResolve();
              }
            );
          });
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
const handleProgramUpload = (req, res) => {
  const username = req.params.username; // Assuming username is passed as a URL parameter
  uploadProgramData(req.file.path, username)
    .then(() => res.send("Program data uploaded and stored in database"))
    .catch((err) => {
      console.error("Error uploading program data:", err);
      res.status(500).send("Error uploading program data");
    });
};

// Download data from the database
const downloadProgramData = (req, res) => {
  const query = `
    SELECT p.prog_name, d.dept_name, p.duration, p.intake, p.semester_count
    FROM Program p
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
      xlsx.utils.book_append_sheet(workbook, worksheet, "Programs");
      const tempFilePath = path.join(__dirname, "../Programs.xlsx");
      xlsx.writeFile(workbook, tempFilePath);
      res.download(tempFilePath, "Program_Data.xlsx", (err) => {
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

// Controller to handle template download
const downloadProgramTemplate = (req, res) => {
  try {
    const filePath = path.join(__dirname, "../program_template.xlsx");
    generateProgramTemplate(filePath);
    res.download(filePath, "program_template.xlsx", (err) => {
      if (err) {
        console.error("Error sending file:", err);
        res.status(500).send("Error occurred during file download");
      }
    });
  } catch (error) {
    res.status(500).send("Error generating the template");
  }
};

module.exports = {
  handleProgramUpload,
  downloadProgramData,
  downloadProgramTemplate,
};
