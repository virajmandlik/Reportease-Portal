// controllers/BulkAchievementController.js
const multer = require("multer");
const xlsx = require("xlsx");
const db = require("../db/dbConnection"); // Adjust the path to your database configuration
const path = require("path");
const fs = require("fs");

// Configure multer for file uploads
const upload = multer({ dest: "uploads/" });

// Function to convert Excel date serial number to a MySQL date string
const excelDateToMySQLDate = (serial) => {
  const date = new Date((serial - 25569) * 86400 * 1000); // Convert Excel date to JavaScript date
  return date.toISOString().split("T")[0]; // Format as YYYY-MM-DD
};

// Bulk Upload Achievements
const bulkUploadAchievements = async (req, res) => {
  const file = req.file;
  const institute_id = req.body.institute_id;

  if (!file) {
    return res.status(400).send("No file uploaded.");
  }

  if (!institute_id) {
    return res.status(400).send("Institute ID is required.");
  }

  try {
    const workbook = xlsx.readFile(file.path);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet);

    let processedCount = 0;
    let errorOccurred = false;

    for (const row of data) {
      const {
        first_name,
        last_name,
        ach_title,
        ach_type,
        ach_asso_with,
        ach_desc,
        ach_date,
        issuer,
        Score,
        app_no,
      } = row;

      // Log the row data for debugging
      console.log(
        first_name,
        last_name,
        ach_title,
        ach_type,
        ach_asso_with,
        ach_desc,
        ach_date,
        issuer,
        Score,
        app_no
      );

      const userResults = await new Promise((resolve, reject) => {
        const userQuery = `
          SELECT user_id FROM user
          WHERE first_name = ? AND last_name = ? AND institute_id = ?
        `;
        db.query(
          userQuery,
          [first_name, last_name, institute_id],
          (err, results) => {
            if (err) return reject(err);
            resolve(results);
          }
        );
      });

      if (userResults.length === 0) {
        console.error(`User  not found for ${first_name} ${last_name}`);
        processedCount++;
        continue; // Skip this row if user is not found
      }

      const user_id = userResults[0].user_id;

      // Format the date correctly
      const formattedDate =
        ach_date instanceof Date
          ? ach_date.toISOString().slice(0, 10)
          : excelDateToMySQLDate(ach_date); // Convert if it's an Excel date serial

      await new Promise((resolve, reject) => {
        const insertQuery = `
          INSERT INTO achievements (user_id, ach_title, ach_type, ach_asso_with, ach_desc, ach_date, issuer, score, app_no)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        db.query(
          insertQuery,
          [
            user_id,
            ach_title,
            ach_type,
            ach_asso_with,
            ach_desc,
            formattedDate, // Use the formatted date here
            issuer,
            Score,
            app_no,
          ],
          (err) => {
            if (err) {
              console.error("Error inserting achievement:", err);
              errorOccurred = true;
              return reject(err);
            }
            processedCount++;
            resolve();
          }
        );
      });
    }

    fs.unlinkSync(file.path); // Clean up the uploaded file
    if (errorOccurred) {
      return res
        .status(500)
        .send("An error occurred while processing some rows.");
    }
    return res.status(200).send("Achievements uploaded successfully.");
  } catch (err) {
    console.error("An error occurred:", err);
    return res.status(500).send("An error occurred while processing the file.");
  }
};

// Generate Achievements Template
const generateAchievementsTemplate = (filePath) => {
  try {
    const headers = [
      {
        first_name: "",
        last_name: "",
        ach_title: "",
        ach_type: "",
        ach_asso_with: "",
        ach_desc: "",
        ach_date: "",
        issuer: "",
        Score: "",
        app_no: "",
      },
    ];
    const worksheet = xlsx.utils.json_to_sheet(headers);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, "Achievements Template");
    xlsx.writeFile(workbook, filePath);
  } catch (error) {
    console.error("Error generating template:", error);
    throw new Error("Template generation failed");
  }
};

// Controller to handle template download
const downloadTemplate = (req, res) => {
  try {
    const filePath = path.join(__dirname, "../achievements_template.xlsx");
    generateAchievementsTemplate(filePath);
    res.download(filePath, "achievements_template.xlsx", (err) => {
      if (err) {
        console.error("Error sending file:", err);
        res.status(500).send("Error occurred during file download");
      } else {
        fs.unlinkSync(filePath); // Clean up the generated file after download
      }
    });
  } catch (error) {
    console.error("Error generating the template:", error);
    res.status(500).send("Error generating the template");
  }
};

// Download Achievements Data
const downloadAchievementsData = async (req, res) => {
  const institute_id = req.query.institute_id; // Get institute_id from query parameters

  if (!institute_id) {
    return res.status(400).send("Institute ID is required");
  }

  try {
    // Step 1: Find all user IDs for the given institute_id
    const queryFindUserIds = `
      SELECT user_id FROM user WHERE institute_id = ?
    `;

    const userResults = await new Promise((resolve, reject) => {
      db.query(queryFindUserIds, [institute_id], (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });

    if (userResults.length === 0) {
      return res.status(404).send("No users found for the specified institute");
    }

    // Extract user_ids from the results
    const userIds = userResults.map((user) => user.user_id);

    // Step 2: Find achievements details for the retrieved user_ids
    const queryFindAchievements = `
      SELECT ach_title, ach_type, ach_asso_with, ach_desc, ach_date, issuer, score, app_no
      FROM achievements
      WHERE user_id IN (?)
    `;

    const achievementsResults = await new Promise((resolve, reject) => {
      db.query(queryFindAchievements, [userIds], (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });

    if (!achievementsResults.length) {
      return res
        .status(404)
        .send("No achievements data found for the specified institute");
    }

    // Step 3: Format dates and generate Excel file
    const formattedResults = achievementsResults.map((item) => ({
      ach_title: item.ach_title,
      ach_type: item.ach_type,
      ach_asso_with: item.ach_asso_with,
      ach_desc: item.ach_desc,
      ach_date: new Date(item.ach_date).toLocaleDateString(), // Format date
      issuer: item.issuer,
      score: item.score,
      app_no: item.app_no,
    }));

    const filePath = path.join(__dirname, "../Achievements_Data.xlsx");
    const worksheet = xlsx.utils.json_to_sheet(formattedResults);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, "Achievements Data");

    // Adjust column widths
    const ws = workbook.Sheets["Achievements Data"];
    ws["!cols"] = [
      { wpx: 200 }, // Width for ach_title
      { wpx: 100 }, // Width for ach_type
      { wpx: 150 }, // Width for ach_asso_with
      { wpx: 200 }, // Width for ach_desc
      { wpx: 100 }, // Width for ach_date
      { wpx: 150 }, // Width for issuer
      { wpx: 100 }, // Width for score
      { wpx: 100 }, // Width for app_no
    ];

    xlsx.writeFile(workbook, filePath);

    res.download(filePath, "Achievements_Data.xlsx", (err) => {
      if (err) {
        console.error("File Download Error:", err);
        res.status(500).send("Error downloading file");
      } else {
        fs.unlinkSync(filePath); // Clean up the generated file after download
      }
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("An error occurred while processing your request");
  }
};

module.exports = {
  upload,
  bulkUploadAchievements,
  downloadTemplate,
  downloadAchievementsData,
};
