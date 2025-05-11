const puppeteer = require("puppeteer");
const eventQueries = require("../queries/EventQueries");
const fs = require("fs");
const path = require("path");
const ejs = require("ejs");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const { Parser } = require("json2csv");
const db = require("../../db/dbConnection.js");
const pdfDirectory = path.join(__dirname, "..", "..", "public", "pdfs");
const htmlDirectory = path.join(
  __dirname,
  "..",
  "..",
  "public",
  "html_reports"
);
const credentialsDirectory = path.join(
  __dirname,
  "..",
  "..",
  "public",
  "report_credentials"
);


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
  const { reportType, reportName, userId, year, departmentName, filePath } =
    reportDetails;
  console.log(
    "The department name before saving into the logs file is ",
    departmentName
  );


  // Generate random password
  const rawPassword = generateRandomPassword();
  const hashedPassword = await bcrypt.hash(rawPassword, 10);


  // Check for existing reports to determine the version
  const versionQuery = `
      SELECT MAX(version) AS max_version
      FROM report_logs
      WHERE department_name = ? AND report_year = ?
  `;
  const [versionResult] = await db
    .promise()
    .query(versionQuery, [departmentName, year]);
  const newVersion = (versionResult[0]?.max_version || 0) + 1; // Increment version


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
    newVersion, // Include the new version
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


const generateEventPdf = async (req, res) => {
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
    const userId = user.user_id || user.institute_id;
    // Fetch event data with enhanced query
    let eventData = [];
    try {
      eventData = await eventQueries.getEventData(options, year);
    } catch (dataError) {
      console.error("Error fetching event data:", dataError);
      return res.status(500).json({
        message: "Failed to retrieve event data",
        error: dataError.message,
      });
    }
    console.log("eventData: ", eventData);
    if (eventData.length === 0) {
      return res.status(404).json({
        message: "No event data found for the specified year and options.",
      });
    }


    // Fetch institute name
    let instituteName = "Institute Name";
    try {
      const instituteId = user.institute_id;
      const instituteData = await eventQueries.getInstituteName(instituteId);
      instituteName = instituteData[0]?.institute_name || instituteName;
    } catch (instituteError) {
      console.warn("Error fetching institute name:", instituteError);
    }


    const pdfFileName = `event_report_${year}_${Date.now()}.pdf`;
    const pdfFilePath = path.join(pdfDirectory, pdfFileName);


    const browser = await puppeteer.launch();
    const page = await browser.newPage();


    // Remove duplicates from eventData array
    const uniqueEventData = [
      ...new Map(eventData.map((item) => [item.event_id, item])).values(),
    ];


    // Enhanced HTML rendering
    const htmlContent = await ejs.renderFile(
      path.join(__dirname, "..", "views", "EventReportView.ejs"),
      {
        uniqueEventData,
        year,
        user,
        instituteName,
        totalEvents: uniqueEventData.length,
        eventTypes: [
          ...new Set(uniqueEventData.map((event) => event.event_type)),
        ],
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
    const departmentResult = await eventQueries.getDepartmentByCoordinatorId(
      userId
    );
    console.log("the department name is ", departmentResult);
    const departmentName = departmentResult[0].dept_name; // Use the dept_name directly
    console.log("the department name is ", departmentName);


    // Check if departmentName is undefined
    if (!departmentName) {
      console.error("Department name is undefined");
      return res.status(500).json({
        message: "Department name could not be retrieved.",
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
      totalEvents: eventData.length,
    });
  } catch (error) {
    console.error("Error generating PDF:", error);
    res.status(500).json({
      message: "Error generating PDF",
      error: error.message,
    });
  }
};


const generateEventHtml = async (req, res) => {
  try {
    const { options, year, user } = req.body;
    // Extract user ID safely
    const userId = user.user_id;
    console.log("the user is at the event controller is ", userId);
    if (!userId) {
      return res.status(400).json({
        message: "User  ID is required but not provided",
      });
    }
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


    // Fetch event data
    let eventData = [];
    try {
      eventData = await eventQueries.getEventData(options, year);
    } catch (dataError) {
      console.error("Error fetching event data:", dataError);
      return res.status(500).json({
        message: "Failed to retrieve event data",
        error: dataError.message,
      });
    }


    // Fetch institute name
    let instituteName = "Institute Name";
    try {
      const instituteId = user.institute_id;
      const instituteData = await eventQueries.getInstituteName(instituteId);
      instituteName = instituteData[0]?.institute_name || instituteName;
    } catch (instituteError) {
      console.warn("Error fetching institute name:", instituteError);
    }


    // Prepare file path
    const htmlFileName = `event_report_${year}_${Date.now()}.html`;
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
        path.join(__dirname, "..", "views", "EventReportView.ejs"),
        {
          eventData,
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


    const departmentResult = await eventQueries.getDepartmentByCoordinatorId(
      userId
    );
    console.log("the department name is ", departmentResult);
    const departmentName = departmentResult[0].dept_name; // Use the dept_name directly
    console.log("the department name is ", departmentName);


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
      eventCount: eventData.length,
    });
  } catch (error) {
    console.error("Unexpected error in generateEventHtml:", error);
    res.status(500).json({
      message: "Unexpected error generating HTML report",
      error: error.message,
    });
  }
};


module.exports = { generateEventPdf, generateEventHtml };






