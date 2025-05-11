const express = require("express");
const router = express.Router();
const pdfEventController = require("../controllers/pdfEventController");
const pdfFinanceController = require("../controllers/pdfFinanceController");
const pdfPlacementController = require("../controllers/pdfPlacementController");
const pdfInfrastructureController = require("../controllers/pdfInfrastructureController");
const pdfClubController = require("../controllers/pdfClubController");
const pdfStudentFacultyController = require("../controllers/StudentAndFacultyAdministrationController"); // Import the new controller
const pdfAcadDepartmentController = require("../controllers/pdfAcadDepartmentController"); // Import the academic department controller
const annualReportController = require("../controllers/annualReportController"); // Import the annual report controller
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');
const db = require("../../db/dbConnection"); // Ensure you have the database connection imported
const mime = require('mime-types');

// Existing routes for generating PDFs and HTML reports
router.post("/generate-event-pdf", pdfEventController.generateEventPdf);
router.post("/generate-event-html", pdfEventController.generateEventHtml);

router.post("/generate-placement-pdf", pdfPlacementController.generatePlacementPdf);
router.post("/generate-placement-html", pdfPlacementController.generatePlacementHtml);

router.post("/generate-finance-pdf", pdfFinanceController.generateFinancePdf);
router.post("/generate-finance-html", pdfFinanceController.generateFinanceHtml);


router.post("/generate-infrastructure-pdf", pdfInfrastructureController.generateInfrastructurePdf);
router.post("/generate-infrastructure-html", pdfInfrastructureController.generateInfrastructureHtml);

router.post("/generate-club-pdf", pdfClubController.generateClubPdf);
router.post("/generate-club-html", pdfClubController.generateClubHtml);

// New routes for Student and Faculty Administration
router.post("/generate-student-faculty-pdf", pdfStudentFacultyController.generateStudentFacultyPdf);
router.post("/generate-student-faculty-html", pdfStudentFacultyController.generateStudentFacultyHtml);

// New routes for Academic Department
router.post("/generate-academic-pdf", pdfAcadDepartmentController.generateAcademicPdf);
router.post("/generate-academic-html", pdfAcadDepartmentController.generateAcademicHtml);

// New routes for Annual Reports
router.post("/generate-annual-report-pdf", annualReportController.generateAnnualReportPdf);
router.post("/generate-annual-report-html", annualReportController.generateAnnualReportHtml);

// Route for verifying report access
router.post("/verify-report-access", async (req, res) => {
    const { logId, password } = req.body;

    try {
        // Fetch report log with more details
        const [logs] = await db.promise().query(
            `SELECT 
                log_id, 
                report_name, 
                report_type, 
                access_password, 
                file_path, 
                is_accessed,
                access_attempts
            FROM report_logs 
            WHERE log_id = ?`, 
            [logId]
        );

        if (logs.length === 0) {
            return res.status(404).json({ 
                message: "Report not found",
                errorCode: 'REPORT_NOT_FOUND'
            });
        }

        const reportLog = logs[0];

        // Check max attempts (optional, add this column to your database)
        if (reportLog.access_attempts >= 3) {
            return res.status(403).json({ 
                message: "Maximum access attempts exceeded",
                errorCode: 'MAX_ATTEMPTS'
            });
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(
            password, 
            reportLog.access_password
        );

        if (isPasswordValid) {
            // Prepare file path
            let filePath;
            if (reportLog.report_type === 'pdf') {
                filePath = `http://localhost:3000/pdfs/${reportLog.report_name}`;
            } else {
                filePath = `http://localhost:3000/html_reports/${reportLog.report_name}`;
            }

            // Reset access attempts
            await db.promise().query(
                'UPDATE report_logs SET access_attempts = 0, is_accessed = TRUE, accessed_at = NOW() WHERE log_id = ?', 
                [logId]
            );

            return res.status(200).json({ 
                filePath,
                reportType: reportLog.report_type,
                message: "Report access verified successfully"
            });
        } else {
            // Increment access attempts
            await db.promise().query(
                'UPDATE report_logs SET access_attempts = access_attempts + 1 WHERE log_id = ?', 
                [logId]
            );

            return res.status(401).json({ 
                message: "Invalid password",
                errorCode: 'INVALID_PASSWORD'
            });
        }
    } catch (error) {
        console.error("Report access error:", error);
        res.status(500).json({ 
            message: "Server error",
            errorCode: 'SERVER_ERROR'
        });
    }
});

// Authentication middleware for file serving
const authenticateFileAccess = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};

// File Serving Routes
router.get(["/pdfs/:filename", "/html_reports/:filename"], authenticateFileAccess, (req, res) => {
    const { filename } = req.params;
    const isHtml = req.path.includes('/html_reports/');
    
    const directoryPath = isHtml
      ? path.join(__dirname, '..', '..', 'public', 'html_reports')
      : path.join(__dirname, '..', '..', 'public', 'pdfs');
    
    const filePath = path.join(directoryPath, filename);
  
    try {
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: "File not found" });
      }
  
      // Determine mime type
      const mimeType = isHtml ? 'text/html' : 'application/pdf';
  
      // Set headers
      res.setHeader('Content-Type', mimeType);
      res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
  
      // Stream the file
      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);
    } catch (error) {
      console.error('File serving error:', error);
      res.status(500).json({ 
        message: "Error serving file", 
        error: error.toString() 
      });
    }
});

router.get("/report-versions/:department/:year", async (req, res) => {
    const { department, year } = req.params;
console.log('at rouytes folder reciefed is ',department," ",year)
    try {
        const [logs] = await db.promise().query(
            `SELECT * FROM report_logs WHERE department_name = ? AND report_year = ?`,
            [department, year]
        );
        console.log('the fetehced logs are ', logs);
        res.status(200).json({ message: "Report versions fetched successfully", logs });
    } catch (error) {
        console.error("Error fetching report versions:", error);
        res.status(500).json({ message: "Error fetching report versions" });
    }
});
module.exports = router;