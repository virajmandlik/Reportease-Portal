const express = require("express");
const multer = require("multer");
const {
  downloadInfrastructureTemplate,
  handleInfrastructureUpload,
  downloadInfrastructureData,
} = require("../controllers/BulkInfrastructureController");

const router = express.Router();
const upload = multer({ dest: "uploads/" }); // Set the destination for uploaded files

// Route to download the infrastructure template
router.get("/template", downloadInfrastructureTemplate);

// Route to upload infrastructure data
router.post("/upload", upload.single("file"), handleInfrastructureUpload);

// Route to download infrastructure data
router.get("/download", downloadInfrastructureData);

module.exports = router;
