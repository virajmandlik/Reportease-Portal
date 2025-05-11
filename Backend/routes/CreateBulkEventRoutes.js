const express = require("express");
const multer = require("multer");
const router = express.Router();
const {
  downloadEventTemplate,
  handleBulkEventUpload,
  downloadEventData,
} = require("../controllers/CreateBulkEventController"); // Adjust the path as necessary

const upload = multer({ dest: "uploads/" }); // Set the destination for uploaded files

// Route to download event template
router.get("/download-template", downloadEventTemplate);

// Route to upload event data
router.post(
  "/upload-data/:institute_id",
  upload.single("file"),
  handleBulkEventUpload
);

// Route to download event data
router.get("/download-data", downloadEventData);

module.exports = router;
