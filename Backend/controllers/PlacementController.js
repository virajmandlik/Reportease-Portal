const fs = require("fs");
const path = require("path");
const xlsx = require("xlsx");
const db = require("../db/dbConnection"); // Import your database connection


// Generate Placement Template
const generatePlacementTemplate = (filePath) => {
  try {
    const headers = [
      {
        student_reg: "", // Change to student_reg
        student_name: "",
        branch: "",
        recruiters: "",
        package_in_lakh: "",
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
const downloadTemplate = (req, res) => {
  try {
    const filePath = path.join(__dirname, "../placement_template.xlsx");
    generatePlacementTemplate(filePath);
    res.download(filePath, "placement_template.xlsx", (err) => {
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
const uploadData = (filePath) => {
  return new Promise((resolve, reject) => {
    try {
      console.log("here i am in upload...");
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
          const {
            student_reg,
            student_name,
            branch,
            recruiters,
            package_in_lakh,
          } = row;


          console.log(
            "the student data at here is ",
            student_reg,
            student_name,
            branch,
            recruiters,
            package_in_lakh
          );


          if (
            !student_reg ||
            !student_name ||
            !branch ||
            !recruiters ||
            !package_in_lakh
          ) {
            console.error("Invalid row data:", row);
            return innerReject(
              new Error("Invalid row: All fields are required.")
            );
          }


          // Find the student_id using the student_reg
          const findStudentSql = `SELECT student_id FROM student WHERE stud_reg = ?`;
          db.query(findStudentSql, [student_reg], (err, result) => {
            if (err) {
              console.error("Error finding student:", err);
              return innerReject(err);
            }


            if (result.length === 0) {
              console.error(
                "Student not found for registration number:",
                student_reg
              );
              return innerReject(
                new Error(
                  `Student not found for registration number: ${student_reg}`
                )
              );
            }


            const student_id = result[0].student_id;


            // Now insert the placement record
            const query = `
              INSERT INTO placements (student_id, student_name, branch, recruiters, package_in_lakh)
              VALUES (?, ?, ?, ?, ?);
            `;
            db.query(
              query,
              [student_id, student_name, branch, recruiters, package_in_lakh],
              (err) => {
                if (err) {
                  console.error("Error inserting row:", err);
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
const handleUpload = (req, res) => {
  uploadData(req.file.path)
    .then(() => res.send("Data uploaded and stored in database"))
    .catch((err) => {
      console.error("Error uploading data:", err);
      res.status(500).send("Error uploading data");
    });
};


// Download data from the database
const downloadData = (req, res) => {
  const query = `
    SELECT student_id, student_name, branch, recruiters, package_in_lakh
    FROM placements
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
      xlsx.utils.book_append_sheet(workbook, worksheet, "Placements");
      const tempFilePath = path.join(__dirname, "../Placements.xlsx");
      xlsx.writeFile(workbook, tempFilePath);
      res.download(tempFilePath, "Placement_Data.xlsx", (err) => {
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


module.exports = {
  downloadTemplate,
  handleUpload,
  downloadData,
};





