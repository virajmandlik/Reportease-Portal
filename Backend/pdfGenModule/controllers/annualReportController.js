const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer");
const bcrypt = require("bcrypt");
const { Parser } = require("json2csv");
const db = require("../../db/dbConnection");
const crypto = require("crypto");

// Define directories
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

  // Check for existing reports to determine the version
  const versionQuery = `
      SELECT MAX(version) AS max_version
      FROM report_logs
      WHERE report_name LIKE ? AND report_year = ?
  `;
  const [versionResult] = await db
    .promise()
    .query(versionQuery, [`annual_report%`, year]);
  const newVersion = (versionResult[0]?.max_version || 0) + 1;

  // Insert into report_logs
  const insertQuery = `
      INSERT INTO report_logs
      (report_type, report_name, generated_by_user_id, report_year,
       department_name, access_password, file_path, version)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const [result] = await db.promise().query(insertQuery, [
    reportType,
    reportName,
    userId,
    year,
    departmentName,
    hashedPassword,
    filePath,
    newVersion,
  ]);

  // Generate CSV with password details
  const csvData = [
    {
      report_name: reportName,
      access_password: rawPassword,
      generated_at: new Date().toISOString(),
      report_type: reportType,
      log_id: result.insertId,
    },
  ];

  const fields = [
    "report_name",
    "access_password",
    "generated_at",
    "report_type",
    "log_id",
  ];
  const json2csvParser = new Parser({ fields });
  const csvContent = json2csvParser.parse(csvData);

  // Save CSV file
  const csvFileName = `report_access_${result.insertId}.csv`;
  const csvPath = path.join(credentialsDirectory, csvFileName);

  fs.writeFileSync(csvPath, csvContent);

  return {
    logId: result.insertId,
    rawPassword,
    csvPath: `/report_credentials/${csvFileName}`,
  };
};

// Function to get reports by year
const getReportsByYear = async (year) => {
  const query = `
    SELECT * FROM report_logs 
    WHERE report_year = ? 
    AND file_path LIKE '%pdf%'
    AND is_accessed = 1
  `;
  const [results] = await db.promise().query(query, [year]);
  return results;
};

const generateAnnualReportPdf = async (req, res) => {
  try {
    const { year, user } = req.body;
    console.log("Generating annual report for year:", year);
    console.log("Request body:", req.body);

    // Fetch all reports from the specified year
    const reports = await getReportsByYear(year);
    
    if (reports.length === 0) {
      return res.status(404).json({
        message: "No reports found for the specified year.",
      });
    }

    // Create a filename for the annual report
    const timestamp = Date.now();
    const reportName = `annual_report_${year}_${timestamp}.pdf`;
    const reportPath = path.join(pdfDirectory, reportName);
    
    // Dynamically import the pdf-merger-js package
    const PDFMerger = await import('pdf-merger-js').then(module => module.default);
    
    // Create PDF merger
    const merger = new PDFMerger();
    
    // Array to keep track of valid PDF paths
    const validPdfPaths = [];
    
    // Check each report and add to merger if file exists
    for (const report of reports) {
      // Extract the file path - convert Windows path to a relative path
      const filePath = report.file_path.split('pdfs\\')[1];
      
      if (filePath) {
        const absolutePath = path.join(pdfDirectory, filePath);
        
        // Check if file exists
        if (fs.existsSync(absolutePath)) {
          validPdfPaths.push(absolutePath);
        } else {
          console.warn(`PDF file not found: ${absolutePath}`);
        }
      }
    }
    
    if (validPdfPaths.length === 0) {
      return res.status(404).json({
        message: "No valid PDF files found for the specified year.",
      });
    }
    
    // Add each valid PDF to the merger
    for (const pdfPath of validPdfPaths) {
      await merger.add(pdfPath);
    }
    
    // Save the merged PDF
    await merger.save(reportPath);
    
    // Get the institute name for the report log
    const instituteId = user.institute_id;
    const instituteQuery = "SELECT institute_name FROM institute WHERE institute_id = ?";
    const [instituteResults] = await db.promise().query(instituteQuery, [instituteId]);
    const instituteName = instituteResults.length > 0 ? instituteResults[0].institute_name : "Unknown Institute";
    
    // Save report log
    const logResult = await saveReportLog({
      reportType: "pdf",
      reportName: reportName,
      userId: user.id,
      year: year,
      departmentName: `Annual Report - ${instituteName}`,
      filePath: reportPath,
    });
    
    // Return the result to the client
    res.status(200).json({
      message: "Annual report generated successfully",
      filePath: reportName,
      logId: logResult.logId,
      passwordCsvPath: logResult.csvPath,
    });
    
  } catch (error) {
    console.error("Error generating annual report:", error);
    res.status(500).json({
      message: "Error generating annual report",
      error: error.toString(),
    });
  }
};

const generateAnnualReportHtml = async (req, res) => {
  try {
    const { year, user } = req.body;
    console.log("Generating annual report HTML for year:", year);
    
    // Fetch all reports from the specified year
    const reports = await getReportsByYear(year);
    
    if (reports.length === 0) {
      return res.status(404).json({
        message: "No reports found for the specified year.",
      });
    }
    
    // Get the institute name
    const instituteId = user.institute_id;
    const instituteQuery = "SELECT institute_name FROM institute WHERE institute_id = ?";
    const [instituteResults] = await db.promise().query(instituteQuery, [instituteId]);
    const instituteName = instituteResults.length > 0 ? instituteResults[0].institute_name : "Unknown Institute";
    
    // Create HTML content for the annual report
    const timestamp = Date.now();
    const reportName = `annual_report_${year}_${timestamp}.html`;
    const reportPath = path.join(htmlDirectory, reportName);
    
    // Generate HTML content with links to all reports
    let htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Annual Report ${year} - ${instituteName}</title>
          <style>
              body {
                  font-family: Arial, sans-serif;
                  line-height: 1.6;
                  margin: 2rem;
              }
              h1, h2 {
                  color: #2c3e50;
              }
              .report-container {
                  margin-bottom: 2rem;
                  padding: 1rem;
                  border: 1px solid #e0e0e0;
                  border-radius: 5px;
              }
              .report-header {
                  display: flex;
                  justify-content: space-between;
                  margin-bottom: 1rem;
                  border-bottom: 1px solid #f0f0f0;
                  padding-bottom: 0.5rem;
              }
              .report-link {
                  display: inline-block;
                  margin-top: 1rem;
                  padding: 0.5rem 1rem;
                  background-color: #3498db;
                  color: white;
                  text-decoration: none;
                  border-radius: 4px;
              }
              .report-link:hover {
                  background-color: #2980b9;
              }
              .timestamp {
                  text-align: right;
                  font-size: 0.8rem;
                  color: #7f8c8d;
                  margin-top: 2rem;
              }
          </style>
      </head>
      <body>
          <h1>Annual Report for Year ${year}</h1>
          <h2>${instituteName}</h2>
          <p>Generated by: ${user.first_name} ${user.last_name}</p>
          <p>This report includes links to all reports generated for the year ${year}.</p>
          
          <div class="reports-list">
    `;
    
    // Add each report to the HTML
    reports.forEach((report, index) => {
      const reportFileName = report.report_name;
      const reportType = report.report_type;
      const departmentName = report.department_name || "Unnamed Department";
      const generatedAt = new Date(report.generated_at).toLocaleString();
      
      htmlContent += `
        <div class="report-container">
            <div class="report-header">
                <h3>Report #${index + 1}: ${departmentName}</h3>
                <span>Generated: ${generatedAt}</span>
            </div>
            <p>File: ${reportFileName}</p>
            <p>Type: ${reportType.toUpperCase()}</p>
            <a class="report-link" href="/pdfs/${reportFileName}" target="_blank">View Report</a>
        </div>
      `;
    });
    
    // Close the HTML content
    htmlContent += `
          </div>
          
          <div class="timestamp">Generated on: ${new Date().toLocaleString()}</div>
      </body>
      </html>
    `;
    
    // Save the HTML file
    fs.writeFileSync(reportPath, htmlContent);
    
    // Save report log
    const logResult = await saveReportLog({
      reportType: "html",
      reportName: reportName,
      userId: user.id,
      year: year,
      departmentName: `Annual Report - ${instituteName}`,
      filePath: reportPath,
    });
    
    // Return the result to the client
    res.status(200).json({
      message: "Annual report HTML generated successfully",
      filePath: `/html_reports/${reportName}`,
      logId: logResult.logId,
      passwordCsvPath: logResult.csvPath,
    });
    
  } catch (error) {
    console.error("Error generating annual report HTML:", error);
    res.status(500).json({
      message: "Error generating annual report HTML",
      error: error.toString(),
    });
  }
};

module.exports = { generateAnnualReportPdf, generateAnnualReportHtml }; 