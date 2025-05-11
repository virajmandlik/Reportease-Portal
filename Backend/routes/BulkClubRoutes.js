const express = require("express");
const multer = require("multer");
const {
  handleUpload,
  downloadTemplate,
  downloadData,
} = require("../controllers/BulkClubController");

const router = express.Router();

// Set up multer for file uploads
const upload = multer({ dest: "uploads/" }); // Specify the destination for uploaded files

// Route for uploading club data
router.post("/upload-clubs", upload.single("file"), handleUpload); // Use multer middleware here

// Route for downloading the club template
router.get("/download-template", downloadTemplate);

// Route for downloading club data
router.get("/download-data", downloadData);

module.exports = router;
