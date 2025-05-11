const puppeteer = require('puppeteer');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const ejs = require('ejs');
const bcrypt = require('bcrypt');
const { Parser } = require('json2csv');
const db = require("../../db/dbConnection.js");
const studentFacultyQueries = require('../queries/StudentAndFacultyAdministrationQueries');

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

const saveReportLog = async (reportDetails) => {
    const { reportType, reportName, userId, year, departmentName, filePath } = reportDetails;
console.log('the department name before saving in to the logs file is ',departmentName)
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

const generateStudentFacultyPdf = async (req, res) => {
    try {
        const { options, year, user } = req.body;
        console.log('Generating Student and Faculty PDF', { year, options, user });

        // Use the user_id from the user object in the request body
        const userId = user.user_id || user.institute_id;

        // Fetch student and faculty data based on selected options
        const studentFacultyData = await studentFacultyQueries.getStudentAndFacultyData(options, year);
        
        if (studentFacultyData.length === 0) {
            return res.status(404).json({
                message: 'No student and faculty data found for the specified year and options.',
            });
        }

        // Fetch institute details
        const instituteNameResult = await studentFacultyQueries.getInstituteName(user.institute_id);
        const instituteName = instituteNameResult[0]?.institute_name || 'Institute Name';

        // Fetch department name based on userId
        const departmentResult = await studentFacultyQueries.getDepartmentByCoordinatorId(userId);
        console.log('the department name is ', departmentResult);
        const departmentName = departmentResult[0].dept_name; // Use the dept_name directly
        console.log('the department name is ', departmentName);

        // Check if departmentName is undefined
        if (!departmentName) {
            console.error('Department name is undefined');
            return res.status(500).json({
                message: 'Department name could not be retrieved.',
            });
        }

        // Additional data fetching based on options
        const additionalData = {};

        // Fetch achievement types if option 3 is selected
        if (options.includes('3')) {
            additionalData.achievementTypes = await studentFacultyQueries.getAchievementTypes(year);
        }

        // Fetch research funding analysis if option 4 is selected
        if (options.includes('4')) {
            additionalData.researchFundingAnalysis = await studentFacultyQueries.getResearchFundingAnalysis(year);
        }

        // Generate unique filename
        const timestamp = Date.now();
        const pdfFileName = `student_faculty_report_${year}_${timestamp}.pdf`;
        const pdfFilePath = path.join(pdfDirectory, pdfFileName);

        // Launch browser and create PDF
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        
        try {
            const page = await browser.newPage();

            // Prepare HTML content with enhanced styling
            const htmlContent = `
            <html>
            <head>
                <style>
                    @page {
                        margin: 50px;
                        border: 1px solid #000;
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
                    }
                    .page-number {
                        position: fixed;
                        bottom: 10px;
                        right: 20px;
                        font-size: 10px;
                        color: #555;
                    }
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-top: 20px;
                    }
                    table, th, td {
                        border: 1px solid #ddd;
                    }
                    th, td {
                        padding: 8px;
                        text-align: left;
                    }
                </style>
            </head>
            <body>
                <!-- Timestamp at top-right corner -->
                <div style="position: fixed; top: 20px; right: 20px; font-size: 12px; color: #555;">
                    Generated on: ${new Date().toLocaleString()}
                </div>

                <!-- Title Page -->
                <div style="page-break-after: always; display: flex; flex-direction: column; justify-content: center; align-items: center; height: 90vh; text-align: center;">
                    <h1 style="margin: 0; font-size: 36px; font-weight: bold;">
                        Student and Faculty Administration Report
                    </h1>
                    <div style="margin-top: 20px; font-size: 18px;">
                        <p style="margin: 5px 0;">Academic Year: ${year}</p>
                        <p style="margin: 5px 0;">Prepared by: ${user.first_name} ${user.last_name}</p>
                        <p style="margin: 5px 0;">Department: ${departmentName}</p>
                        <p style="margin: 5px 0;">Email: ${user.email}</p>
                    </div>
                </div>

                <!-- Summary Statistics -->
                <div>
                    <h2>Summary Statistics</h2>
                    <table>
                        <tr>
                            <th>Total Students</th>
                            <td>${studentFacultyData.length}</td>
                        </tr>
                        <tr>
                            <th>Total Departments</th>
                            <td>${new Set(studentFacultyData.map(data => data.dept_name)).size}</td>
                        </tr>
                    </table>
                </div>

                <!-- Student Basic Information -->
                ${options.includes('1') ? `
                <div>
                    <h2>Student Basic Information</h2>
                    <table> 
                        <thead>
                            <tr>
                                <th>First Name</th>
                                <th>Last Name</th>
                                <th>Email</th>
                                <th>Mobile Number</th>
                                <th>Gender</th>
                                <th>Department</th>
                                <th>Grade</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${studentFacultyData.map(data => `
                                <tr>
                                    <td>${data.first_name || 'N/A'}</td>
                                    <td>${data.last_name || 'N/A'}</td>
                                    <td>${data.email_id || 'N/A'}</td>
                                    <td>${data.mobile_number || 'N/A'}</td>
                                    <td>${data.gender || 'N/A'}</td>
                                    <td>${data.dept_name || 'N/A'}</td>
                                    <td>${data.grade || 'N/A'}</td>
                                    <td>${data.res_status || 'N/A'}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
                ` : ''}

                <!-- Achievements and Recognitions -->
                ${options.includes('3') && additionalData.achievementTypes ? `
                <div>
                    <h2>Achievements and Recognitions</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>Achievement Type</th>
                                <th>Count</th>
                                <th>Total Score</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${additionalData.achievementTypes.map(achievement => `
                                <tr>
                                    <td>${achievement.ach_type || 'N/A'}</td>
                                    <td>${achievement.type_count || 0}</td>
                                    <td>${achievement.total_score ? achievement.total_score.toLocaleString() : '0'}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
                ` : ''}

                <!-- Research Funding Analysis -->
                ${options.includes('4') && additionalData.researchFundingAnalysis ? `
                <div>
                    <h2>Research Funding Analysis</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>Funded By</th>
                                <th>Total Projects</th>
                                <th>Total Funding</th>
                                <th>Average Funding</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${additionalData.researchFundingAnalysis.map(funding => `
                                <tr>
                                    <td>${funding.funded_by || 'N/A'}</td>
                                    <td>${funding.total_projects || 0}</td>
                                    <td>₹ ${funding.total_funding ? funding.total_funding.toLocaleString() : '0'}</td>
                                    <td>₹ ${funding.average_funding ? funding.average_funding.toLocaleString () : '0'}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
                ` : ''}

                <!-- Footer with Institute Name -->
                <div class="footer">
                    ${instituteName}
                </div>

                <!-- Page Number -->
                <div class="page-number">
                    <script type="text/php">
                        if ( isset($pdf) ) {
                            $pdf->page_script('page {PAGE_NUM} of {PAGE_COUNT}');
                        }
                    </script>
                </div>
            </body>
            </html>
            `;

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
        const reportDetails = {
            reportType: 'pdf',
            reportName: pdfFileName,
            userId: userId,
            year,
            departmentName,
            filePath: pdfFilePath
        };

        // Save report log and generate CSV
        const { logId, rawPassword, csvPath } = await saveReportLog(reportDetails);

        return res.status(200).json({ 
            message: 'PDF generated successfully', 
            filePath: `http://localhost:3000/pdfs/${pdfFileName}`, 
            passwordCsvPath: csvPath,
            logId
        });

    } catch (error) {
        console.error('Error generating Student and Faculty PDF:', error);
        res.status(500).json({ 
            message: 'Error generating Student and Faculty PDF',
            error: error.toString(),
            stack: error.stack
        });
    }
};

const generateStudentFacultyHtml = async (req, res) => {
    try {
        const { options, year, user } = req.body;
        console.log('Generating Student and Faculty HTML', { year, options, user });

        // Extract user ID safely
        const userId = user.user_id || user.institute_id;

        if (!userId) {
            return res.status(400).json({
                message: 'User  ID is required but not provided',
            });
        }

        // Fetch student and faculty data based on selected options
        const studentFacultyData = await studentFacultyQueries.getStudentAndFacultyData(options, year);
        
        if (studentFacultyData.length === 0) {
            return res.status(404).json({
                message: 'No student and faculty data found for the specified year and options.',
            });
        }

        // Fetch institute details
        const instituteNameResult = await studentFacultyQueries.getInstituteName(user.institute_id);
        const instituteName = instituteNameResult[0]?.institute_name || 'Institute Name';

        // Additional data fetching based on options
        const additionalData = {};

        // Fetch achievement types if option 3 is selected
        if (options.includes('3')) {
            additionalData.achievementTypes = await studentFacultyQueries.getAchievementTypes(year);
        }

        // Fetch research funding analysis if option 4 is selected
        if (options.includes('4')) {
            additionalData.researchFundingAnalysis = await studentFacultyQueries.getResearchFundingAnalysis(year);
        }

        // Generate unique filename
        const timestamp = Date.now();
        const htmlFileName = `student_faculty_report_${year}_${timestamp}.html`;
        const htmlFilePath = path.join(htmlDirectory, htmlFileName);

        // Render HTML content
        const htmlContent = await ejs.renderFile(
            path.join(__dirname, '..', 'views', 'StudentAndFacultyAdministrationReportView.ejs'),
            {
                studentFacultyData,
                year,
                user,
                instituteName,
                additionalData,
                options
            }
        );

        // Write HTML file
        fs.writeFileSync(htmlFilePath, htmlContent, 'utf-8');

        // Improved department name determination

        const departmentResult = await studentFacultyQueries.getDepartmentByCoordinatorId(userId);
        console.log('the department name is ', departmentResult);
        const departmentName = departmentResult[0].dept_name; // Use the dept_name directly
        console.log('the department name is ', departmentName);

        // let departmentName = 'All Departments';    
        // if (studentFacultyData.length > 0) {
        //     if (studentFacultyData[0]?.dept_name) {
        //         departmentName = studentFacultyData[0].dept_name;
        //     } else if (options.length < 6) {
        //         departmentName = 'Selected Departments';
        //     }
        // }
        
        const reportDetails = {
            reportType: 'html',
            reportName: htmlFileName,
            userId: userId, // Use the safely extracted user ID
            year,
            departmentName,
            filePath: htmlFilePath
        };

        // Save report log and generate CSV
        const { logId, rawPassword, csvPath } = await saveReportLog(reportDetails);

        return res.status(200).json({
            message: 'HTML generated successfully',
            filePath: `http://localhost:3000/html_reports/${htmlFileName}`, // Full URL
            passwordCsvPath: csvPath,
            logId
        });

    } catch (error) {
        console.error('Error generating Student and Faculty HTML:', error);
        res.status(500).json({ 
            message: 'Error generating Student and Faculty HTML report',
            error: error.toString(),
            stack: error.stack
        });
    }
};




// const generateStudentFacultyHtml = async (req, res) => {
//   try {
//     const { options, year, user } = req.body;
//     console.log('Generating Student and Faculty HTML', { year, options, user });

//     // Extract user ID safely
//     const userId = user.user_id || user.institute_id;

//     if (!userId) {
//       return res.status(400).json({
//         message: 'User ID is required but not provided',
//       });
//     }

//     // Fetch student and faculty data based on selected options
//     const studentFacultyData = await studentFacultyQueries.getStudentAndFacultyData(options, year);
    
//     if (studentFacultyData.length === 0) {
//       return res.status(404).json({
//         message: 'No student and faculty data found for the specified year and options.',
//       });
//     }

//     // Fetch institute details
//     const instituteNameResult = await studentFacultyQueries.getInstituteName(user.institute_id);
//     const instituteName = instituteNameResult[0]?.institute_name || 'Institute Name';

//     // Additional data fetching based on options
//     const additionalData = {};

//     // Fetch achievement types if option 3 is selected
//     if (options.includes('3')) {
//       additionalData.achievementTypes = await studentFacultyQueries.getAchievementTypes(year);
//     }

//     // Fetch research funding analysis if option 4 is selected
//     if (options.includes('4')) {
//       additionalData.researchFundingAnalysis = await studentFacultyQueries.getResearchFundingAnalysis(year);
//     }

//     // Generate unique filename
//     const timestamp = Date.now();
//     const htmlFileName = `student_faculty_report_${year}_${timestamp}.html`;
//     const htmlFilePath = path.join(htmlDirectory, htmlFileName);

//     // Render HTML content
//     const htmlContent = await ejs.renderFile(
//       path.join(__dirname, '..', 'views', 'StudentAndFacultyAdministrationReportView.ejs'),
//       {
//         studentFacultyData,
//         year,
//         user,
//         instituteName,
//         additionalData,
//         options
//       }
//     );

//     // Write HTML file
//     fs.writeFileSync(htmlFilePath, htmlContent, 'utf-8');

//      // Improved department name determination
//      let departmentName = 'All Departments';    
//      if (studentFacultyData.length > 0) {
//        if (studentFacultyData[0]?.dept_name) {
//          departmentName = studentFacultyData[0].dept_name;
//        } else if (options.length < 6) {
//          departmentName = 'Selected Departments';
//        }
//      }
    
//     const reportDetails = {
//       reportType: 'html',
//       reportName: htmlFileName,
//       userId: userId, // Use the safely extracted user ID
//       year,
//       departmentName,
//       filePath: htmlFilePath
//     };

//     // Save report log and generate CSV
//     const { logId, rawPassword, csvPath } = await saveReportLog(reportDetails);

//     return res.status(200).json({
//       message: 'HTML generated successfully',
//       filePath: `http://localhost:3000/html_reports/${htmlFileName}`, // Full URL
//       passwordCsvPath: csvPath,
//       logId
//     });

//   } catch (error) {
//     console.error('Error generating Student and Faculty HTML:', error);
//     res.status(500).json({ 
//       message: 'Error generating Student and Faculty HTML report',
//       error: error.toString(),
//       stack: error.stack
//     });
//   }
// };

module.exports = { 
  generateStudentFacultyPdf, 
  generateStudentFacultyHtml 
};