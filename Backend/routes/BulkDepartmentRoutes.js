const express = require("express");
const multer = require("multer");
const {
  downloadDepartmentTemplate,
  handleDepartmentUpload,
  downloadDepartmentData,
} = require("../controllers/BulkDepartmentController"); // Adjust the path as necessary

const router = express.Router();

// Set up multer for file uploads
const upload = multer({ dest: "uploads/" }); // Specify the directory for uploaded files

// Route to download the department template
router.get("/template", downloadDepartmentTemplate);

// Route to upload department data from XLSX
router.post("/upload", upload.single("file"), handleDepartmentUpload);

// Route to download department data
router.get("/download", downloadDepartmentData);

module.exports = router;
