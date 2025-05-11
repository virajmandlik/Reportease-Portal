const puppeteer = require("puppeteer");
const infrastructureQueries = require("../queries/InfrastructureQueries");
const fs = require("fs");
const path = require("path");
const ejs = require("ejs");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const { Parser } = require("json2csv");
const db = require("../../db/dbConnection.js");
const pdfDirectory = path.join(__dirname, "..", "..", "public", "pdfs");
const htmlDirectory = path.join(__dirname, "..", "..", "public", "html_reports");
const credentialsDirectory = path.join(__dirname, "..", "..", "public", "report_credentials");

// Ensure directories exist
[pdfDirectory, htmlDirectory, credentialsDirectory].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Function to generate a random password
const generateRandomPassword = () => {
  return crypto.randomBytes(8).toString("hex");
};

// Function to save report log
const saveReportLog = async (reportDetails) => {
  const { reportType, reportName, userId, year, departmentName, filePath } = reportDetails;

  // Generate random password
  const rawPassword = generateRandomPassword();
  const hashedPassword = await bcrypt.hash(rawPassword, 10);

  try {
    // Prepare the query
    const query = "INSERT INTO report_logs (report_type, report_name, generated_by_user_id, report_year, department_name, access_password, file_path, version) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
    const values = [reportType, reportName, userId, year, departmentName, hashedPassword, filePath, 1];

    // Execute the query
    const [result] = await db.promise().query(query, values);

    // Generate CSV with password details
    const csvData = [{
      report_name: reportName,
      access_password: rawPassword,
      generated_at : new Date().toISOString(),
      report_type: reportType,
      log_id: result.insertId
    }];

    const fields = ['report_name', 'access_password', 'generated_at', 'report_type', 'log_id'];
    const json2csvParser = new Parser({ fields });
    const csvContent = json2csvParser.parse(csvData);

    // Save CSV file
    const csvFileName = `report_access_${result.insertId}.csv`;
    const csvPath = path.join(credentialsDirectory, csvFileName);
    fs.writeFileSync(csvPath, csvContent);

    return {
      logId: result.insertId,
      rawPassword, // Return the raw password for display
      csvPath: `/report_credentials/${csvFileName}`
    };
  } catch (error) {
    console.error("Error saving report log:", error);
    throw error;
  }
};

const generateInfrastructurePdf = async (req, res) => {
  console.log('Generating PDF...');
  try {
    const { options, year, user } = req.body;

    // Validate input
    if (!options || !year || !user) {
      return res.status(400).json({
        message: "Missing required parameters",
        details: {
          options: !!options,
          year: !!year,
          user: !!user,
        },
      });
    }
    const userId = user.user_id;
    console.log('the user id at controller is ',userId)
    // Fetch infrastructure data
    let infrastructureData = [];
    try {
      infrastructureData = await infrastructureQueries.getInfrastructureData(options, year);
    } catch (dataError) {
      console.error("Error fetching infrastructure data:", dataError);
      return res.status(500).json({
        message: "Failed to retrieve infrastructure data",
        error: dataError.message,
      });
    }

    if (infrastructureData.length === 0) {
      return res.status(404).json({
        message: "No infrastructure data found for the specified year and options.",
      });
    }

    // Fetch institute name
    let instituteName = "Institute Name";
    try {
      const instituteId = user.institute_id;
      const instituteData = await infrastructureQueries.getInstituteName(instituteId);
      instituteName = instituteData[0]?.institute_name || instituteName;
    } catch (instituteError) {
      console.warn("Error fetching institute name:", instituteError);
    }

    const pdfFileName = `infrastructure_report_${year}_${Date.now()}.pdf`;
    const pdfFilePath = path.join(pdfDirectory, pdfFileName);

    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Enhanced HTML rendering
 const htmlContent = await ejs.renderFile(
      path.join(__dirname, "..", "views", "InfrastructureReportView.ejs"),
      {
        infrastructureData,
        year,
        user,
        instituteName,
      }
    );

    await page.setContent(htmlContent, { waitUntil: "networkidle0" });
    await page.pdf({
      path: pdfFilePath,
      format: "A4",
      printBackground: true,
      margin: {
        top: "20mm",
        right: "20mm",
        bottom: "20mm",
        left: "20mm",
      },
    });

    await browser.close();

    // Fetch department name based on userId
    const departmentResult = await infrastructureQueries.getDepartmentByCoordinatorId(userId);
    console.log("The department results is ", departmentResult);
    const departmentName = departmentResult[0]?.dept_name; // Use optional chaining to avoid errors
    console.log("The department name is ", departmentName);

    // Check if departmentName is undefined
    if (!departmentName) {
      console.error('Department name is undefined');
      return res.status(500).json({
        message: 'Department name could not be retrieved.',
      });
    }

    // Prepare report details for logging
    const reportDetails = {
      reportType: "pdf",
      reportName: pdfFileName,
      userId: user.user_id,
      year,
      departmentName,
      filePath: pdfFilePath,
    };

    // Save report log and generate CSV
    const { logId, rawPassword, csvPath } = await saveReportLog(reportDetails);

    return res.status(200).json({
      message: "PDF generated successfully",
      filePath: pdfFileName,
      passwordCsvPath: csvPath,
      logId,
    });
  } catch (error) {
    console.error("Error generating PDF:", error);
    res.status(500).json({
      message: "Error generating PDF",
      error: error.message,
    });
  }
};

const generateInfrastructureHtml = async (req, res) => {
  try {
    const { options, year, user } = req.body;

    // Validate input
    if (!options || !year || !user) {
      return res.status(400).json({
        message: "Missing required parameters",
        details: {
          options: !!options,
          year: !!year,
          user: !!user,
        },
      });
    }

    // Fetch infrastructure data
    let infrastructureData = [];
    try {
      infrastructureData = await infrastructureQueries.getInfrastructureData(options, year);
    } catch (dataError) {
      console.error("Error fetching infrastructure data:", dataError);
      return res.status(500).json({
        message: "Failed to retrieve infrastructure data",
        error: dataError.message,
      });
    }

    // Fetch institute name
    let instituteName = "Institute Name";
    try {
      const instituteId = user.institute_id;
      const instituteData = await infrastructureQueries.getInstituteName(instituteId);
      instituteName = instituteData[0]?.institute_name || instituteName;
    } catch (instituteError) {
      console.warn("Error fetching institute name:", instituteError);
    }

    // Prepare file path
    const htmlFileName = `infrastructure_report_${year}_${Date.now()}.html`;
    const htmlFilePath = path.join(htmlDirectory, htmlFileName);

    // Ensure directory exists
    try {
      const htmlDirectory = path.dirname(htmlFilePath);
      if (!fs.existsSync(htmlDirectory)) {
        fs.mkdirSync(htmlDirectory, { recursive: true });
      }
    } catch (dirError) {
      console.error("Error creating directory:", dirError);
      return res.status(500).json({
        message: "Failed to create report directory",
        error: dirError.message,
      });
    }

    // Render HTML content
    let htmlContent;
    try {
      htmlContent = await ejs.renderFile(
        path.join(__dirname, "..", "views", "InfrastructureReportView.ejs"),
        {
          infrastructureData,
          year,
          user,
          instituteName,
        }
      );
    } catch (renderError) {
      console.error("Error rendering HTML template:", renderError);
      return res.status(500).json({
        message: "Failed to generate HTML report",
        error: renderError.message,
      });
    }

    // Write HTML file
    try {
      fs.writeFileSync(htmlFilePath, htmlContent, "utf-8");
    } catch (writeError) {
      console.error("Error writing HTML file:", writeError);
      return res.status(500).json({
        message: "Failed to save HTML report",
        error: writeError.message,
      });
    }

    const departmentResult = await infrastructureQueries .getDepartmentByCoordinatorId(user.user_id);
    console.log("The department name is ", departmentResult);
    const departmentName = departmentResult[0]?.dept_name; // Use optional chaining to avoid errors
    console.log("The department name is ", departmentName);

    // Check if departmentName is undefined
    if (!departmentName) {
      console.error('Department name is undefined');
      return res.status(500).json({
        message: 'Department name could not be retrieved.',
      });
    }

    // Prepare report details for logging
    const reportDetails = {
      reportType: "html",
      reportName: htmlFileName,
      userId: user.user_id,
      year,
      departmentName,
      filePath: htmlFilePath,
    };

    // Save report log and generate CSV
    const { logId, rawPassword, csvPath } = await saveReportLog(reportDetails);

    return res.status(200).json({
      message: "HTML generated successfully",
      filePath: `/html_reports/${htmlFileName}`,
      passwordCsvPath: csvPath, // Ensure this is included in the response
    });
  } catch (error) {
    console.error("Unexpected error in generateInfrastructureHtml:", error);
    res.status(500).json({
      message: "Unexpected error generating HTML report",
      error: error.message,
    });
  }
};

module.exports = { generateInfrastructurePdf, generateInfrastructureHtml };