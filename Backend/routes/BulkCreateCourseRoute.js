const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer({ dest: "uploads/" }); // Set up multer for file uploads
const {
  downloadCourseTemplate,
  handleCourseUpload,
  downloadCourseData,
} = require("../controllers/BulkCreateCourseController"); // Adjust the path as necessary

// Route to download course template
router.get("/download-template", downloadCourseTemplate);

// Route to upload course data
router.post("/bulk-upload", upload.single("file"), handleCourseUpload);

// Route to download course data
router.get("/download", downloadCourseData);

module.exports = router;
