const puppeteer = require("puppeteer");
const userQueries = require("../queries/FinanceQueries");
const fs = require("fs");
const path = require("path");
const ejs = require("ejs");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const { Parser } = require("json2csv");
const db = require("../../db/dbConnection.js");
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

const pdfDirectory = path.join(__dirname, "..", "..", "public", "pdfs");

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

const generateFinancePdf = async (req, res) => {
  try {
    const { options, year, user } = req.body; // Get user details from request
    console.log("hey i am inside generatePdf");
    console.log()
    console.log("Request body:", req.body);

    // Generate financial data based on options and year
    const financialData = await userQueries.getFinancialData(options, year);
    console.log("Financial data retrieved:", financialData);

    const pdfFileName = `report_${year}.pdf`; // Example file name
    const pdfFilePath = path.join(pdfDirectory, pdfFileName); // Use the absolute path

    // Use Puppeteer to generate PDF
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Check if financial data is not empty before generating the PDF
    if (financialData.length === 0) {
      return res.status(404).json({
        message: "No financial data found for the specified year and options.",
      });
    }

    // Fetch institute name based on institute_id
    const instituteId = user.institute_id; // Get institute_id from user
    const instituteData = await userQueries.getInstituteName(instituteId); // You need to implement this function
    console.log("the institute data is ", instituteData);
    const instituteName = instituteData[0]?.institute_name || "Institute Name"; // Default name if not found

    // Prepare the HTML content for the PDF
    const htmlContent = `
      <html>
      <head>
        <style>
          @page {
            margin: 50px;
            border: 1px solid #000; /* Border around each page */
          }
          body {
            font-family: Arial, sans-serif;
          }
          .footer {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            text-align: center;
            font-size: 10px;
            javascript } .page-number { position: fixed; bottom: 0; right: 0; font-size: 10px; } </style> </head> <body> <!-- Timestamp at top-right corner --> <div style="position: fixed; top: 20px; right: 20px; font-size: 12px; color: #555;"> Generated on: ${new Date().toLocaleString()} </div>
                <!-- Introductory content -->
    <div style="page-break-after: always; display: flex; flex-direction: column; justify-content: center; align-items: center; height: 90vh; text-align: center; font-family: Arial, sans-serif; line-height: 1.8;">
      <h1 style="margin: 0; font-size: 36px; font-weight: bold;">Financial Report for Year: ${year}</h1>
      <div style="margin-top: 20px; font-size: 18px;">
        <p style="margin: 5px 0;">Prepared by: ${user.first_name} ${
      user.last_name
    }</p>
        <p style="margin: 5px 0;">Department: Finance Department</p>
      </div>
    </div>

    <!-- Financial data table -->
  <!-- Financial data table -->
<table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
  <thead>
    <tr>
      <th style="border: 1px solid #000; padding: 8px; text-align: left;">Description</th>
      <th style="border: 1px solid #000; padding: 8px; text-align: left;">Amount</th>
    </tr>
  </thead>
  <tbody>
    ${financialData
      .map(
        (data) => `
      <tr>
        <td style="border: 1px solid #000; padding: 8px;">${
          data.description ||
          data.event_name ||
          data.club_name ||
          data.dept_name || "N/A"
        }</td>
        <td style="border: 1px solid #000; padding: 8px;">${data.amount || data.event_budget || data.total_budget || "N/A"}</td>
      </tr>
    `
      )
      .join("")}
  </tbody>
</table>

    <!-- Footer with Institute Name -->
    <div class="footer" style="position: fixed; bottom: 30px; left: 0; right: 0; text-align: center; font-size: 16px; font-weight: bold;">
      ${instituteName}
    </div>

    <!-- Page Number -->
    <div class="page-number" style="position: fixed; bottom: 10px; right: 20px; font-size: 12px; color: #555;">
      <script type="text/php">
        if ( isset($pdf) ) {
          $pdf->page_script('page {PAGE_NUM} of {PAGE_COUNT}');
        }
      </script>
    </div>
  </body>
  </html>
`;

    await page.setContent(htmlContent, { waitUntil: "domcontentloaded" });
    await page.pdf({ path: pdfFilePath, format: "A4" });

    await browser.close();

    // Check if the file exists after generation
    if (!fs.existsSync(pdfFilePath)) {
      return res
        .status(404)
        .json({ message: "PDF not found after generation" });
    }

    // Prepare report details for logging
    const departmentResult = await userQueries.getDepartmentByCoordinatorId(
      user.user_id
    );
    const departmentName =
      departmentResult[0]?.dept_name || "Unknown Department";

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

    // Send the PDF file path or success message to the frontend
    return res.status(200).json({
      message: "PDF generated successfully",
      filePath: pdfFileName,
      passwordCsvPath: csvPath,
      logId,
      totalRecords: financialData.length,
    });
  } catch (error) {
    console.error("Error generating PDF:", error);
    res.status(500).json({ message: "Error generating PDF" });
  }
};

const generateFinanceHtml = async (req, res) => {
  try {
    console.log("Inside generateFinanceHtml");
    const { options, year, user } = req.body; // Get user details from request
    console.log("Request body:", req.body);

    // Extract user ID safely
    const userId = user.user_id;
    console.log('The user ID in finance controller is', userId);
    if (!userId) {
      return res.status(400).json({
        message: 'User  ID is required but not provided',
      });
    }

    // Validate input
    if (!options || !year || !user) {
      return res.status(400).json({
        message: 'Missing required parameters',
        details: {
          options: !!options,
          year: !!year,
          user: !!user
        }
      });
    }

    // Fetch financial data based on selected options and year
    const financialData = await userQueries.getFinancialData(options, year);
    console.log("Financial data retrieved:", financialData);

    // Fetch institute name based on institute_id
    const instituteId = user.institute_id; // Get institute_id from user
    const instituteData = await userQueries.getInstituteName(instituteId);
    console.log("Institute data retrieved:", instituteData);
    const instituteName = instituteData[0]?.institute_name || "Institute Name"; // Default name if not found

    // Prepare file path
    const htmlFileName = `financial_report_${year}_${Date.now()}.html`; // Dynamic file name based on the year
    const htmlFilePath = path.join(
      __dirname,
      "..",
      "..",
      "public",
      "html_reports",
      htmlFileName
    );

    // Ensure the folder exists to store HTML files, if not, create it
    const htmlDirectory = path.dirname(htmlFilePath);
    if (!fs.existsSync(htmlDirectory)) {
      // Create the directory and any necessary subdirectories if they don't exist
      fs.mkdirSync(htmlDirectory, { recursive: true });
      console.log("Directory created:", htmlDirectory); // Log for confirmation
    }

    // Render HTML content using EJS
    const htmlContent = await ejs.renderFile(
      path.join(__dirname, "..", "views", "FinanceReportView.ejs"),
      {
        financialData,
        year,
        user, // Pass user details for use in EJS
        instituteName, // Pass institute name
      }
    );

    // Write the generated HTML content to a file
    fs.writeFileSync(htmlFilePath, htmlContent, "utf-8");
    console.log("HTML file generated successfully:", htmlFilePath);

    // Fetch department name based on userId
    const departmentResult = await userQueries.getDepartmentByCoordinatorId(userId);
    console.log('The department name is', departmentResult);
    const departmentName = departmentResult[0]?.dept_name || "Unknown Department"; // Use the dept_name directly

    // Prepare report details for logging
    const reportDetails = {
      reportType: 'html',
      reportName: htmlFileName,
      userId: userId,
      year,
      departmentName,
      filePath: htmlFilePath
    };

    // Save report log and generate CSV
    const { logId, rawPassword, csvPath } = await saveReportLog(reportDetails);

    // Return the path for downloading the file along with CSV path
    return res.status(200).json({
      message: "HTML generated successfully",
      filePath: `/html_reports/${htmlFileName}`, // Path relative to the public folder
      passwordCsvPath: csvPath, // Ensure this is included in the response
      logId, // Include log ID for further reference
      totalRecords: financialData.length // Include total records for user information
    });
  } catch (error) {
    console.error("Error generating HTML:", error);
    res.status(500).json({ message: "Error generating HTML report" });
  }
};

// Correctly export both functions
module.exports = { generateFinancePdf, generateFinanceHtml };