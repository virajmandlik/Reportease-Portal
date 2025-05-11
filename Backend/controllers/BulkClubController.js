const fs = require("fs");
const path = require("path");
const xlsx = require("xlsx");
const db = require("../db/dbConnection"); // Import your database connection

// Generate Club Template
const generateClubTemplate = (filePath) => {
  try {
    const headers = [
      {
        club_name: "",
        club_type: "",
        year: "",
        first_name: "",
        last_name: "",
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
    const filePath = path.join(__dirname, "../club_template.xlsx");
    generateClubTemplate(filePath);
    res.download(filePath, "club_template.xlsx", (err) => {
      if (err) {
        console.error("Error sending file:", err);
        res.status(500).send("Error occurred during file download");
      }
    });
  } catch (error) {
    res.status(500).send("Error generating the template");
  }
};

// Upload data from CSV to database
const uploadData = (filePath, institute_id) => {
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
          const { club_name, club_type, year, first_name, last_name } = row;

          if (!club_name || !club_type || !year || !first_name || !last_name) {
            return innerReject(
              new Error("Invalid row: All fields are required.")
            );
          }

          // Find the user_id using first_name and last_name
          const findUserSql = `SELECT user_id FROM user WHERE first_name = ? AND last_name = ? AND institute_id = ?`;
          db.query(
            findUserSql,
            [first_name, last_name, institute_id],
            (err, result) => {
              if (err) {
                return innerReject(err);
              }

              if (result.length === 0) {
                return innerReject(
                  new Error(`User  not found for ${first_name} ${last_name}`)
                );
              }

              const user_id = result[0].user_id;

              // Now insert the club record
              const query = `
              INSERT INTO Club (club_name, club_head, club_type, institute_id, year)
              VALUES (?, ?, ?, ?, ?);
            `;
              db.query(
                query,
                [club_name, user_id, club_type, institute_id, year],
                (err) => {
                  if (err) {
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
const handleUpload = (req, res) => {
  const { institute_id } = req.body; // Get institute_id from the request body
  uploadData(req.file.path, institute_id)
    .then(() => res.send("Clubs uploaded and stored in database"))
    .catch((err) => {
      console.error("Error uploading data:", err);
      res.status(500).send("Error uploading data");
    });
};

// Download data from the database
const downloadData = (req, res) => {
  const instituteId = req.query.institute_id; // Get institute_id from query parameters
  const query = `
    SELECT club_id, club_name, club_head, club_type, year
    FROM Club
    WHERE institute_id = ?
  `;
  db.query(query, [instituteId], (err, results) => {
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
      xlsx.utils.book_append_sheet(workbook, worksheet, "Clubs");
      const tempFilePath = path.join(__dirname, "../Clubs.xlsx");
      xlsx.writeFile(workbook, tempFilePath);
      res.download(tempFilePath, "Club_Data.xlsx", (err) => {
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
