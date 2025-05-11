const express = require("express");
const multer = require("multer");
const {
  downloadTemplate,
  handleUpload,
  downloadData,
} = require("../controllers/PlacementController");

const router = express.Router();
const upload = multer({ dest: "uploads/" });

// Route to download the placement template
router.get("/download", downloadTemplate);

// Route to upload placement data
router.post("/upload",upload.single("file"), handleUpload);

// Route to download placement data from the database
router.get("/downloaddata", downloadData);

module.exports = router;
