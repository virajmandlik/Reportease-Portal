const express = require("express");
const {
  upload,
  bulkUploadAchievements,
  downloadTemplate,
  downloadAchievementsData,
} = require("../controllers/BulkAchievementController");

const router = express.Router();

// Route for bulk uploading achievements
router.post("/bulk-achievement", upload.single("file"), bulkUploadAchievements);

// Route for downloading the template
router.get("/download-template", downloadTemplate);

// Route for downloading achievements data
router.get("/download-achievements", downloadAchievementsData);

module.exports = router;
