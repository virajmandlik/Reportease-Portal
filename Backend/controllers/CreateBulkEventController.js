const fs = require("fs");
const path = require("path");
const xlsx = require("xlsx");
const db = require("../db/dbConnection"); // Import your database connection

// Generate Event Template
const generateEventTemplate = (filePath) => {
  try {
    const headers = [
      {
        event_name: "",
        event_description: "",
        event_type: "",
        event_date: "",
        host: "",
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
const downloadEventTemplate = (req, res) => {
  try {
    const filePath = path.join(__dirname, "../event_template.xlsx");
    generateEventTemplate(filePath);
    res.download(filePath, "event_template.xlsx", (err) => {
      if (err) {
        console.error("Error sending file:", err);
        res.status(500).send("Error occurred during file download");
      }
    });
  } catch (error) {
    res.status(500).send("Error generating the template");
  }
};

const uploadEventData = (filePath, institute_id) => {
  console.log("Inside uploadEventData function");
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
          const {
            event_name,
            event_description,
            event_type,
            event_date,
            host,
          } = row;

          // Log the event_date to check its type and value
          console.log(
            "Raw event_date:",
            event_date,
            "Type:",
            typeof event_date
          );

          // Validate and format the date
          const formattedDate = formatDate(event_date);
          if (!formattedDate) {
            console.error("Invalid date format:", event_date);
            return innerReject(new Error("Invalid date format."));
          }

          if (
            !event_name ||
            !event_description ||
            !event_type ||
            !formattedDate ||
            !host
          ) {
            console.error("Invalid row data:", row);
            return innerReject(
              new Error("Invalid row: All fields are required.")
            );
          }

          // Find the department ID using the host
          const findDeptSql = `SELECT dept_id FROM department WHERE dept_name = ? AND institute_id = ?`;
          db.query(findDeptSql, [host, institute_id], (err, result) => {
            if (err) {
              console.error("Error finding department:", err);
              return innerReject(err);
            }

            if (result.length === 0) {
              console.error("Department not found for host:", host);
              return innerReject(
                new Error(`Department not found for host: ${host}`)
              );
            }

            const deptId = result[0].dept_id;

            // Now insert the event record
            const query = `
              INSERT INTO Events (event_name, event_description, event_type, event_date, dept_id)
              VALUES (?, ?, ?, ?, ?);
            `;
            db.query(
              query,
              [
                event_name,
                event_description,
                event_type,
                formattedDate,
                deptId,
              ],
              (err) => {
                if (err) {
                  console.error("Error inserting event:", err);
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
          fs.unlinkSync(filePath); // Delete the file after processing
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

// Function to format date
const formatDate = (dateStr) => {
  // Check if the dateStr is a number (Excel serial date)
  if (typeof dateStr === "number") {
    // Convert Excel date serial number to JavaScript Date
    const jsDate = new Date((dateStr - 25569) * 86400 * 1000);
    return jsDate.toISOString().split("T")[0]; // Return in YYYY-MM-DD format
  }

  // If it's a string, proceed with the existing logic
  if (typeof dateStr !== "string") {
    console.error("dateStr is not a string:", dateStr);
    return null; // Return null if the date is not a string
  }

  const dateParts = dateStr.split("-");
  if (dateParts.length !== 3) return null; // Invalid format

  const day = parseInt(dateParts[0], 10);
  const month = parseInt(dateParts[1], 10);
  const year = parseInt(dateParts[2], 10);

  // Check if the date is valid
  if (month < 1 || month > 12 || day < 1 || day > 31) return null; // Invalid date

  // Create a new Date object
  const date = new Date(year, month - 1, day); // month is 0-indexed in JS
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  )
    return null; // Invalid date

  // Return the date in YYYY-MM-DD format
  return date.toISOString().split("T")[0];
};

// Controller for data upload
const handleBulkEventUpload = (req, res) => {
  const filePath = req.file.path; // Assuming you are using middleware to handle file uploads
  const institute_id = req.params.institute_id;
  console.log("Inside handleBulkEventUpload function");

  uploadEventData(filePath, institute_id)
    .then(() => res.send("Events uploaded and stored in database"))
    .catch((err) => {
      console.error("Error uploading events:", err);
      res.status(500).send("Error uploading events: " + err.message);
    });
};

// Download event data from the database
const downloadEventData = (req, res) => {
  const query = `
    SELECT 
      e.event_name, 
      e.event_description, 
      e.event_type, 
      e.event_date, 
      d.dept_name AS host_name
    FROM Events e
    LEFT JOIN Department d ON e.dept_id = d.dept_id
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
      xlsx.utils.book_append_sheet(workbook, worksheet, "Event Data"); // Updated sheet name
      const tempFilePath = path.join(__dirname, "../Events.xlsx");
      xlsx.writeFile(workbook, tempFilePath);
      res.download(tempFilePath, "Event_Data.xlsx", (err) => {
        if (err) {
          console.error("File Download Error:", err);
          res.status(500).send("Error downloading file");
        }
        fs.unlinkSync(tempFilePath); // Delete the file after sending
      });
    } catch (error) {
      console.error("Excel Processing Error:", error);
      res.status(500).send("Error generating Excel file");
    }
  });
};

module.exports = {
  downloadEventTemplate,
  handleBulkEventUpload,
  downloadEventData,
};
