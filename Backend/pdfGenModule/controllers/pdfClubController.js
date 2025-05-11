const puppeteer = require('puppeteer');
const clubQueries = require('../queries/ClubQueries');
const fs = require('fs');
const path = require('path');
const ejs = require('ejs');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const { Parser } = require('json2csv');
const db = require("../../db/dbConnection.js");

const pdfDirectory = path.join(__dirname, '..', '..', 'public', 'pdfs');
const htmlDirectory = path.join(__dirname, '..', '..', 'public', 'html_reports');
const credentialsDirectory = path.join(__dirname, '..', '..', 'public', 'report_credentials');

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

const generateClubPdf = async (req, res) => {
  try {
    const { options, year, user } = req.body;
    console.log('Generating Club PDF', { year, options, user });

    // Fetch club data based on selected options
    const clubData = await clubQueries.getClubData(options, year);
    
    if (clubData.length === 0) {
      return res.status(404).json({
        message: 'No club data found for the specified year and options.',
      });
    }

    // Fetch institute name
    const instituteNameResult = await clubQueries.getInstituteName(user.institute_id);
    const instituteName = instituteNameResult[0]?.institute_name || 'Institute Name';

    // Additional data fetching based on options
    const additionalData = {};

    // Fetch club faculties if option 5 is selected
    if (options.includes('5')) {
      additionalData.facultyData = await clubQueries.getClubFaculties(user.institute_id, year);
    }

    // Fetch club event summaries if option 6 is selected
    if (options.includes('6')) {
      additionalData.clubEventSummaries = await Promise.all(
        clubData.map(async (club) => {
          try {
            const summary = await clubQueries.getClubEventSummary(club.club_id, year);
            return {
              clubName: club.club_name,
              summary : summary[0] || {
                total_events: 0,
                total_budget: 0,
                avg_budget: 0,
                event_types: 'No Events',
                first_event: null,
                last_event: null
              }
            };
          } catch (error) {
            console.error(`Error fetching summary for ${club.club_name}:`, error);
            return {
              clubName: club.club_name,
              summary: {
                total_events: 0,
                total_budget: 0,
                avg_budget: 0,
                event_types: 'No Events',
                first_event: null,
                last_event: null
              }
            };
          }
        })
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const pdfFileName = `club_report_${year}_${timestamp}.pdf`;
    const pdfFilePath = path.join(pdfDirectory, pdfFileName);

    // Launch browser and create PDF
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    try {
      const page = await browser.newPage();

      // Render HTML content
      const htmlContent = await ejs.renderFile(
        path.join(__dirname, '..', 'views', 'ClubReportView.ejs'),
        {
          clubData,
          year,
          user,
          instituteName,
          additionalData,
          options
        }
      );

      // Set content and generate PDF
      await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
      await page.pdf({ 
        path: pdfFilePath, 
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20mm',
          bottom: '20mm',
          left: '20mm',
          right: '20mm'
        }
      });
    } finally {
      await browser.close();
    }

    // Prepare report details for logging
    const departmentResult = await clubQueries.getDepartmentByCoordinatorId(user.user_id);
    const departmentName = departmentResult[0]?.dept_name || 'Department Name';

    // Check if departmentName is undefined
    if (!departmentName) {
      console.error('Department name is undefined');
      return res.status(500).json({
        message: 'Department name could not be retrieved.',
      });
    }

    // Save report log and generate CSV
    const reportDetails = {
      reportType: 'pdf',
      reportName: pdfFileName,
      userId: user.user_id,
      year,
      departmentName,
      filePath: pdfFilePath
    };

    const { logId, rawPassword, csvPath } = await saveReportLog(reportDetails);

    return res.status(200).json({ 
      message: 'PDF generated successfully', 
      filePath: pdfFileName,
      passwordCsvPath: csvPath,
      logId
    });

  } catch (error) {
    console.error('Error generating Club PDF:', error);
    res.status(500).json({ 
      message: 'Error generating Club PDF',
      error: error.toString(),
      stack: error.stack
    });
  }
};

const generateClubHtml = async (req, res) => {
  try {
    const { options, year, user } = req.body;
    console.log('Generating Club HTML', { year, options, user });

    // Fetch club data based on selected options
    const clubData = await clubQueries.getClubData(options, year);
    
    if (clubData.length === 0) {
      return res.status(404).json({
        message: 'No club data found for the specified year and options.',
      });
    }

    // Fetch institute name
    const instituteNameResult = await clubQueries.getInstituteName(user.institute_id);
    const instituteName = instituteNameResult[0]?.institute_name || 'Institute Name';

    // Additional data fetching based on options
    const additionalData = {};

    // Fetch club faculties if option 5 is selected
    if (options.includes('5')) {
      additionalData.facultyData = await clubQueries.getClubFaculties(user.institute_id, year);
    }

    // Fetch club event summaries if option 6 is selected
    if (options.includes('6')) {
      additionalData.clubEventSummaries = await Promise.all(
        clubData.map(async (club) => {
          try {
            const summary = await clubQueries.getClubEventSummary(club.club_id, year);
            return {
              clubName: club.club_name,
              summary: summary[0] || {
                total_events: 0,
                total_budget: 0,
                avg_budget: 0,
                event_types: 'No Events',
                first_event: null,
                last_event: null }
            };
          } catch (error) {
            console.error(`Error fetching summary for ${club.club_name}:`, error);
            return {
              clubName: club.club_name,
              summary: {
                total_events: 0,
                total_budget: 0,
                avg_budget: 0,
                event_types: 'No Events',
                first_event: null,
                last_event: null
              }
            };
          }
        })
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const htmlFileName = `club_report_${year}_${timestamp}.html`;
    const htmlFilePath = path.join(htmlDirectory, htmlFileName);

    // Render HTML content
    const htmlContent = await ejs.renderFile(
      path.join(__dirname, '..', 'views', 'ClubReportView.ejs'),
      {
        clubData,
        year,
        user,
        instituteName,
        additionalData,
        options
      }
    );

    // Write HTML file
    fs.writeFileSync(htmlFilePath, htmlContent, 'utf-8');

    // Prepare report details for logging
    const departmentResult = await clubQueries.getDepartmentByCoordinatorId(user.user_id);
    const departmentName = departmentResult[0]?.dept_name || 'Department Name';

    // Check if departmentName is undefined
    if (!departmentName) {
      console.error('Department name is undefined');
      return res.status(500).json({
        message: 'Department name could not be retrieved.',
      });
    }

    // Save report log and generate CSV
    const reportDetails = {
      reportType: 'html',
      reportName: htmlFileName,
      userId: user.user_id,
      year,
      departmentName,
      filePath: htmlFilePath
    };

    const { logId, rawPassword, csvPath } = await saveReportLog(reportDetails);

    return res.status(200).json({
      message: 'HTML generated successfully',
      filePath: `/html_reports/${htmlFileName}`,
      passwordCsvPath: csvPath,
      logId
    });

  } catch (error) {
    console.error('Error generating Club HTML:', error);
    res.status(500).json({ 
      message: 'Error generating Club HTML report',
      error: error.toString(),
      stack: error.stack
    });
  }
};

module.exports = { 
  generateClubPdf, 
  generateClubHtml 
};