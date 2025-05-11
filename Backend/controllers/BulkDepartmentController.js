const fs = require("fs");
const path = require("path");
const xlsx = require("xlsx");
const db = require("../db/dbConnection");
const md5 = require("md5");

// Generate Department Template
const generateDepartmentTemplate = (filePath) => {
  console.log('the tempoelate is hereee',filePath)
  try {
    const headers = [
      {
        department: "",
        deptType: "",
        first_name: "",
        last_name: "",
        email: "",
        username: "",
        phone_number: "",
        password: "",
        gender: "",
      },
    ];
    const worksheet = xlsx.utils.json_to_sheet(headers);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, "Department Template");
    xlsx.writeFile(workbook, filePath);
  } catch (error) {
    console.error("Error generating template:", error);
    throw new Error("Template generation failed");
  }
};

// Controller to handle template download
const downloadDepartmentTemplate = (req, res) => {
  console.log('the tempoelate is hereee baba')
  try {
    const filePath = path.join(__dirname, "../department_template.xlsx");
    generateDepartmentTemplate(filePath);
    res.download(filePath, "department_template.xlsx", (err) => {
      if (err) {
        console.error("Error sending file:", err);
        res.status(500).send("Error occurred during file download");
      }
    });
  } catch (error) {
    res.status(500).send("Error generating the template");
  }
};

// Upload department data from XLSX to database
const uploadDepartmentData = async (filePath, institute_id) => {
  try {
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const results = xlsx.utils.sheet_to_json(worksheet);

    if (!results.length) {
      fs.unlinkSync(filePath);
      throw new Error("The uploaded file is empty or has invalid content.");
    }

    const promises = results.map(async (row) => {
      const {
        department,
        deptType,
        first_name,
        last_name,
        email,
        username,
        phone_number,
        password,
        gender,
      } = row;

      // Validate required fields
      if (
        !department ||
        !deptType ||
        !first_name ||
        !last_name ||
        !email ||
        !username ||
        !phone_number ||
        !password ||
        !gender
      ) {
        throw new Error("Invalid row: All fields are required.");
      }

      // Hash the password
      const hashedPassword = md5(password);

      // Insert the user
      const userSql = `
        INSERT INTO user
        (first_name, last_name, email_id, username, mobile_number, password, gender, type_id, institute_id, is_active)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      const userValues = [
        first_name,
        last_name,
        email,
        username,
        phone_number,
        hashedPassword,
        gender,
        2, // Assuming type_id for department coordinators is 2
        institute_id, // Use the institute_id passed from the frontend
        1, // Assuming is_active is 1 for active users
      ];

      const userResult = await new Promise((resolve, reject) => {
        db.query(userSql, userValues, (err, result) => {
          if (err) return reject(err);
          resolve(result);
        });
      });

      // Insert the department
      const deptSql = `
        INSERT INTO department
        (dept_name, institute_id, dept_type, coordinator_id)
        VALUES (?, ?, ?, ?)
      `;
      const deptValues = [
        department,
        institute_id, // Use the institute_id passed from the frontend
        deptType,
        userResult.insertId,
      ];

      await new Promise((resolve, reject) => {
        db.query(deptSql, deptValues, (err, result) => {
          if (err) return reject(err);
          resolve(result);
        });
      });
    });

    await Promise.all(promises);
    fs.unlinkSync(filePath); // Clean up the uploaded file
  } catch (err) {
    fs.unlinkSync(filePath); // Ensure the file is deleted on error
    throw err;
  }
};

// Controller for data upload
const handleDepartmentUpload = async (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }

  const { institute_id } = req.body; // Get institute_id from the request body

  try {
    await uploadDepartmentData(req.file.path, institute_id); // Pass institute_id to the upload function
    res.send("Department data uploaded and stored in database");
  } catch (err) {
    console.error("Error uploading data:", err);
    res.status(500).send("Error uploading data");
  }
};

// Download data from the database for a specific institute
const downloadDepartmentData = (req, res) => {
  const institute_id = req.query.institute_id; // Get institute_id from query parameters

  if (!institute_id) {
    return res.status(400).send("Institute ID is required");
  }

  const query = `
    SELECT d.dept_name,  d.dept_type, u.first_name, u.last_name, u.email_id, u.username, u.mobile_number
    FROM department d
    JOIN user u ON d.coordinator_id = u.user_id
    WHERE d.institute_id = ?
  `;

  db.query(query, [institute_id], (err, results) => {
    if (err) {
      console.error("Database Error:", err);
      return res.status(500).send("Database error");
    }
    if (!results.length) {
      return res.status(404).send("No data found for the specified institute");
    }
    try {
      const filePath = path.join(__dirname, "../Department_Data.xlsx");
      const worksheet = xlsx.utils.json_to_sheet(results);
      const workbook = xlsx.utils.book_new();
      xlsx.utils.book_append_sheet(workbook, worksheet, "Department Data");
      xlsx.writeFile(workbook, filePath);
      res.download(filePath, "Department_Data.xlsx", (err) => {
        if (err) {
          console.error("File Download Error:", err);
          res.status(500).send("Error downloading file");
        }
        fs.unlinkSync(filePath); // Clean up the generated file
      });
    } catch (error) {
      console.error("Excel Processing Error:", error);
      res.status(500).send("Error generating Excel file");
    }
  });
};

module.exports = {
  downloadDepartmentTemplate,
  handleDepartmentUpload,
  downloadDepartmentData,
};
