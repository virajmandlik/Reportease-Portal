const puppeteer = require("puppeteer");
const acadQueries = require("../queries/AcadDepartmentQueries");
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
[pdfDirectory, htmlDirectory, credentialsDirectory].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Function to generate a random password
const generateRandomPassword = () => {
  return crypto.randomBytes(8).toString('hex');
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
      WHERE department_name = ? AND report_year = ?
  `;
  const [versionResult] = await db.promise().query(versionQuery, [departmentName, year]);
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
      newVersion // Include the new version
  ]);

  // Generate CSV with password details
  const csvData = [{
      report_name: reportName,
      access_password: rawPassword,
      generated_at: new Date().toISOString(),
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
      rawPassword,
      csvPath: `/report_credentials/${csvFileName}`
  };
};

const generateAcademicPdf = async (req, res) => {
  try {
    const { year, user } = req.body;

    const studentData = await acadQueries.getStudentData(year);
    const facultyData = await acadQueries.getFacultyData(year);
    const programData = await acadQueries.getProgramData(year);
    const resultData = await acadQueries.getResultData(year);

    const pdfFileName = `academic_report_${year}.pdf`;
    const pdfFilePath = path.join(pdfDirectory, pdfFileName);

    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    if (
      studentData.length === 0 &&
      facultyData.length === 0 &&
      programData.length === 0 &&
      resultData.length === 0
    ) {
      return res.status(404).json({
        message: "No academic data found for the specified year.",
      });
    }

    const instituteId = user.institute_id;
    const instituteData = await acadQueries.getInstituteName(instituteId);
    const instituteName = instituteData[0]?.institute_name || "Institute Name";

    // Prepare the HTML content for the PDF with styling
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta http-equiv="X-UA-Compatible" content=" IE=edge">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Academic Report for Year: ${year}</title>
          <style>
              :root {
                  --primary-color: #2c3e50;
                  --secondary-color: #3498db;
                  --text-color: #333;
                  --background-color: #f4f6f7;
                  --table-header-bg: #2c3e50;
                  --table-alternate-row: #f2f2f2;
              }

              * {
                  margin: 0;
                  padding: 0;
                  box-sizing: border-box;
              }

              body {
                  font-family: 'Arial', sans-serif;
                  line-height: 1.6;
                  color: var(--text-color);
                  background-color: var(--background-color);
              }

              .container {
                  max-width: 1100px;
                  margin: 0 auto;
                  padding: 20px;
                  background-color: white;
                  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
              }

              .generated-info {
                  position: fixed;
                  top: 20px;
                  right: 20px;
                  font-size: 12px;
                  color: #555;
                  z-index: 1000;
              }

              h1 {
                  text-align: center;
                  color: var(--primary-color);
                  margin-bottom: 20px;
              }

              h2, h3, h4 {
                  text-align: center;
                  color: var(--secondary-color);
                  margin-bottom: 10px;
              }

              table {
                  width: 100%;
                  border-collapse: collapse;
                  margin: 20px 0;
                  box-shadow: 0 2px 3px rgba(0,0,0,0.1);
              }

              table th {
                  background-color: var(--table-header-bg);
                  color: white;
                  padding: 12px;
                  text-align: left;
              }

              table td {
                  padding: 10px;
                  border: 1px solid #ddd;
              }

              table tr:nth-child(even) {
                  background-color: var(--table-alternate-row);
              }

              table tr:hover {
                  background-color: #e6e6e6;
                  transition: background-color 0.3s ease;
              }

              .footer {
                  text-align: center;
                  padding: 15px;
                  background-color: var(--primary-color);
                  color: white;
                  margin-top: 20px;
              }

              @media print {
                  .generated-info {
                      position: absolute;
                  }
                  body {
                      background-color: white;
                  }
              }
          </style>
      </head>
      <body>
          <div class="generated-info">
              Generated on: ${new Date().toLocaleString()}
          </div>
          <div class="container">
              <h1>Academic Report for Year: ${year}</h1>
              <h2>Prepared by: ${user.first_name} ${user.last_name}</h2>
              <h3>Department: Academic Department</h3>
              <h4>Institute: ${instituteName}</h4>

              <h4>Student Data</h4>
              <table>
                  <thead>
                      <tr>
                          <th>Student ID</th>
                          <th>User ID</th>
                          <th>Program ID</th>
                          <th>Current Semester</th>
                          <th>Registration Number</th>
                          <th>Year</th>
                      </tr>
                  </thead>
                  <tbody>
                      ${studentData.length > 0 ? studentData.map(student => `
                          <tr>
                              <td>${student.student_id}</td>
                              <td>${student.user_id}</td>
                              <td>${student.program_id}</td>
                              <td>${student.current_semester || 'N/A'}</td>
                              <td>${student.stud_reg || 'N/A'}</td>
                              <td>${student.year || 'N/A'}</td>
                          </tr>`).join("") : `
                          <tr>
                              <td colspan="6" style="text-align: center;">No student data available for the selected year.</td>
                          </tr>`}
                  </tbody>
              </table>

              <h4>Faculty Data</h4>
              <table>
                  <thead>
                      <tr>
                          <th>Faculty ID</th>
                          <th>User ID</th>
                          <th>Registration Number</th>
                          <th>Department ID</th>
                          <th>Year</th>
                      </tr>
                  </thead>
                  < 
                  <tbody>
                      ${facultyData.length > 0 ? facultyData.map(faculty => `
                          <tr>
                              <td>${faculty.faculty_id}</td>
                              <td>${faculty.user_id}</td>
                              <td>${faculty.reg_no || 'N/A'}</td>
                              <td>${faculty.dept_id}</td>
                              <td>${faculty.year || 'N/A'}</td>
                          </tr>`).join("") : `
                          <tr>
                              <td colspan="5" style="text-align: center;">No faculty data available for the selected year.</td>
                          </tr>`}
                  </tbody>
              </table>

              <h4>Program Data</h4>
              <table>
                  <thead>
                      <tr>
                          <th>Program ID</th>
                          <th>Program Name</th>
                          <th>Department ID</th>
                          <th>Duration</th>
                          <th>Intake</th>
                          <th>Semester Count</th>
                          <th>Year</th>
                      </tr>
                  </thead>
                  <tbody>
                      ${programData.length > 0 ? programData.map(program => `
                          <tr>
                              <td>${program.prog_id}</td>
                              <td>${program.prog_name}</td>
                              <td>${program.dept_id}</td>
                              <td>${program.duration}</td>
                              <td>${program.intake || 'N/A'}</td>
                              <td>${program.semester_count}</td>
                              <td>${program.year || 'N/A'}</td>
                          </tr>`).join("") : `
                          <tr>
                              <td colspan="7" style="text-align: center;">No program data available for the selected year.</td>
                          </tr>`}
                  </tbody>
              </table>

              <h4>Result Data</h4>
              <table>
                  <thead>
                      <tr>
                          <th>Result ID</th>
                          <th>Enrollment ID</th>
                          <th>Grade</th>
                          <th>Status</th>
                          <th>Year</th>
                      </tr>
                  </thead>
                  <tbody>
                      ${resultData.length > 0 ? resultData.map(result => `
                          <tr>
                              <td>${result.result_id}</td>
                              <td>${result.enrollment_id}</td>
                              <td>${result.grade || 'N/A'}</td>
                              <td>${result.res_status || 'N/A'}</td>
                              <td>${result.year || 'N/A'}</td>
                          </tr>`).join("") : `
                          <tr>
                              <td colspan="5" style="text-align: center;">No result data available for the selected year.</td>
                          </tr>`}
                  </tbody>
              </table>

              <div class="footer">
                  © ${new Date().getFullYear()} ${instituteName}. All Rights Reserved.
              </div>
          </div>
      </body>
      </html>
    `;

    await page.setContent(htmlContent, { waitUntil: "domcontentloaded" });
    await page.pdf({ path: pdfFilePath, format: "A4" });
    await browser.close();

    if (!fs.existsSync(pdfFilePath)) {
      return res.status(404).json({ message: "PDF not found after generation" });
    }

    // Prepare report details for logging
    const departmentResult = await acadQueries.getDepartmentByCoordinatorId(user.user_id);
    const departmentName = departmentResult[0]?.dept_name || "Department Name";

    const reportDetails = {
      reportType: 'pdf',
      reportName: pdfFileName,
      userId: user.user_id,
      year,
      departmentName,
      filePath: pdfFilePath
    };

    // Save report log and generate CSV
    const { logId, rawPassword, csvPath } = await saveReportLog(reportDetails);

    return res.status(200).json({ 
      message: 'PDF generated successfully', 
      filePath: pdfFileName,
      passwordCsvPath: csvPath,
      logId,
      totalStudents: studentData.length,
      totalFaculty: facultyData.length,
      totalPrograms: programData.length,
      totalResults: resultData.length
    });
  } catch (error) {
    console.error("Error generating PDF:", error);
    res.status(500).json({ message: "Error generating PDF", error: error.message });
  }
};

const generateAcademicHtml = async (req, res) => {
  try {
    const { year, user } = req.body;

    const studentData = await acadQueries.getStudentData(year);
    const facultyData = await acadQueries.getFacultyData(year);
    const programData = await acadQueries.getProgramData(year);
    const resultData = await acadQueries.getResultData(year);

    const htmlFileName = `academic_report_${year}.html`;
    const htmlFilePath = path.join(htmlDirectory, htmlFileName);

    // Ensure the folder exists to store HTML files, if not, create it
    const htmlDirectoryPath = path.dirname(htmlFilePath);
    if (!fs.existsSync(htmlDirectoryPath)) {
      fs.mkdirSync(htmlDirectoryPath, { recursive: true });
    }

    // Render HTML content using EJS
    const htmlContent = await ejs.renderFile(
      path.join(__dirname, "..", "views", "AcadDepartmentReportView.ejs"),
      {
        studentData,
        facultyData,
        programData,
        resultData,
        year,
        user,
        instituteName: (await acadQueries.getInstituteName(user.institute_id))[0]?.institute_name || "Institute Name",
      }
    );

    // Write the generated HTML content to a file
    fs.writeFileSync(htmlFilePath, htmlContent, "utf-8");

    // Prepare report details for logging
    const departmentResult = await acadQueries.getDepartmentByCoordinatorId(user.user_id);
    const departmentName = departmentResult[0]?.dept_name || "Department Name";

    const reportDetails = {
      reportType: 'html',
      reportName: htmlFileName,
      userId: user.user_id,
      year,
      departmentName,
      filePath: htmlFilePath
    };

    // Save report log and generate CSV
    const { logId, rawPassword, csvPath } = await saveReportLog(reportDetails);

    return res.status(200).json({
      message: 'HTML generated successfully',
      filePath: `/html_reports/${htmlFileName}`,
      passwordCsvPath: csvPath,
      logId,
      totalStudents: studentData.length,
      totalFaculty: facultyData.length,
      totalPrograms: programData.length,
      totalResults: resultData.length
    });
  } catch (error) {
    console.error("Error generating HTML:", error);
    res.status(500).json({ message: "Error generating HTML report", error: error.message });
  }
};

// Correctly export both functions
module.exports = { generateAcademicPdf, generateAcademicHtml };