const express = require("express");
const multer = require("multer");
const bulkProgramController = require("../controllers/bulkProgramController");

const router = express.Router();
const upload = multer({ dest: "uploads/" }); // Set up multer for file uploads

// Route to upload program data
router.post(
  "/upload/:username",
  upload.single("file"),
  bulkProgramController.handleProgramUpload
);

// Route to download program data
router.get("/download", bulkProgramController.downloadProgramData);

// Route to download program template
router.get("/template", bulkProgramController.downloadProgramTemplate);

module.exports = router;
