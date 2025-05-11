const fs = require("fs");
const path = require("path");
const xlsx = require("xlsx");
const db = require("../db/dbConnection");

// Generate Infrastructure Template
const generateInfrastructureTemplate = (filePath) => {
  try {
    const headers = [
      {
        dept: "",
        infraDesc: "",
        infraBudget: "",
        startDate: "",
        endDate: "",
        year: "",
      },
    ];
    const worksheet = xlsx.utils.json_to_sheet(headers);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(
      workbook,
      worksheet,
      "Infrastructure Template"
    );
    xlsx.writeFile(workbook, filePath);
  } catch (error) {
    console.error("Error generating template:", error);
    throw new Error("Template generation failed");
  }
};

// Controller to handle template download
const downloadInfrastructureTemplate = (req, res) => {
  try {
    const filePath = path.join(__dirname, "../infrastructure_template.xlsx");
    generateInfrastructureTemplate(filePath);
    res.download(filePath, "infrastructure_template.xlsx", (err) => {
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

// Function to convert Excel date serial number to a MySQL date string
const excelDateToMySQLDate = (serial) => {
  const date = new Date((serial - 25569) * 86400 * 1000); // Convert Excel date to JavaScript date
  return date.toISOString().split("T")[0]; // Format as YYYY-MM-DD
};

// Upload infrastructure data from XLSX to database
const uploadInfrastructureData = async (filePath, institute_id) => {
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
      const { dept, infraDesc, infraBudget, startDate, endDate, year } = row;

      // Validate required fields
      if (
        !dept ||
        !infraDesc ||
        !infraBudget ||
        !startDate ||
        !endDate ||
        !year
      ) {
        throw new Error("Invalid row: All fields are required.");
      }

      // Convert Excel date serial numbers to MySQL date format
      const formattedStartDate = excelDateToMySQLDate(startDate);
      const formattedEndDate = excelDateToMySQLDate(endDate);

      // Find department ID based on department name and institute ID
      const queryFindDept = `SELECT dept_id FROM department WHERE dept_name = ? AND institute_id = ?`;
      const deptResults = await new Promise((resolve, reject) => {
        db.query(queryFindDept, [dept, institute_id], (err, results) => {
          if (err) return reject(err);
          resolve(results);
        });
      });

      if (deptResults.length === 0) {
        throw new Error(
          `Department "${dept}" not found for the specified institute.`
        );
      }

      const deptId = deptResults[0].dept_id;

      // Insert the infrastructure
      const infraSql = `
        INSERT INTO infrastructure
        (dept_id, description, budget, startdate, enddate, year)
        VALUES (?, ?, ?, ?, ?,?)
      `;
      const infraValues = [
        deptId,
        infraDesc,
        infraBudget,
        formattedStartDate,
        formattedEndDate,
        year,
      ];

      await new Promise((resolve, reject) => {
        db.query(infraSql, infraValues, (err, result) => {
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
const handleInfrastructureUpload = async (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }

  const { institute_id } = req.body; // Get institute_id from the request body

  try {
    await uploadInfrastructureData(req.file.path, institute_id); // Pass institute_id to the upload function
    res.send("Infrastructure data uploaded and stored in database");
  } catch (err) {
    console.error("Error uploading data:", err);
    res.status(500).send("Error uploading data: " + err.message);
  }
};

const downloadInfrastructureData = async (req, res) => {
  const institute_id = req.query.institute_id; // Get institute_id from query parameters

  if (!institute_id) {
    return res.status(400).send("Institute ID is required");
  }

  try {
    // Step 1: Find all department IDs for the given institute_id
    const queryFindDeptIds = `
      SELECT dept_id FROM department WHERE institute_id = ?
    `;

    const deptResults = await new Promise((resolve, reject) => {
      db.query(queryFindDeptIds, [institute_id], (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });

    if (deptResults.length === 0) {
      return res
        .status(404)
        .send("No departments found for the specified institute");
    }

    // Extract dept_ids from the results
    const deptIds = deptResults.map((dept) => dept.dept_id);

    // Step 2: Find infrastructure details for the retrieved dept_ids
    const queryFindInfrastructure = `
      SELECT description, budget, startdate, enddate, year
      FROM infrastructure
      WHERE dept_id IN (?)
    `;

    const infrastructureResults = await new Promise((resolve, reject) => {
      db.query(queryFindInfrastructure, [deptIds], (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });

    if (!infrastructureResults.length) {
      return res
        .status(404)
        .send("No infrastructure data found for the specified institute");
    }

    // Step 3: Format dates and generate Excel file
    const formattedResults = infrastructureResults.map((item) => ({
      description: item.description,
      budget: item.budget,
      startdate: new Date(item.startdate).toLocaleDateString(), // Format date
      enddate: new Date(item.enddate).toLocaleDateString(), // Format date
      year: item.year,
    }));

    const filePath = path.join(__dirname, "../Infrastructure_Data.xlsx");
    const worksheet = xlsx.utils.json_to_sheet(formattedResults);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, "Infrastructure Data");

    // Adjust column widths
    const ws = workbook.Sheets["Infrastructure Data"];
    ws["!cols"] = [
      { wpx: 200 }, // Width for description
      { wpx: 100 }, // Width for budget
      { wpx: 100 }, // Width for startdate
      { wpx: 100 }, // Width for enddate
      { wpx: 100 }, // Width for year
    ];

    xlsx.writeFile(workbook, filePath);

    res.download(filePath, "Infrastructure_Data.xlsx", (err) => {
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
  downloadInfrastructureTemplate,
  handleInfrastructureUpload,
  downloadInfrastructureData,
};
