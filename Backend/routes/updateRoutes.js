const express = require("express");
const multer = require("multer");
const xlsx = require("xlsx");
const { handleUpdate } = require("../controllers/updateController");
const path = require("path");
const router = express.Router();
const upload = multer({ dest: "uploads/" });
const { generateTemplate } = require("../controllers/updateController");
const fs = require("fs");

// Route to handle updates
router.post("/update", upload.single("file"), (req, res) => {
  const { course_id } = req.body; // Get course_id from request body
  if (!course_id) return res.status(400).send("Course ID is required");

  const workbook = xlsx.readFile(req.file.path);
  const sheetName = workbook.SheetNames[0];
  const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

  handleUpdate(data, course_id)
    .then(() => res.send("Data updated successfully"))
    .catch((err) => {
      console.error("Error updating data:", err);
      res.status(500).send("Error updating data");
    });
});

// Route to download the template
router.get("/download-template", (req, res) => {
  const filePath = path.join(__dirname, "template.xlsx");

  // Generate the template
  generateTemplate(filePath);

  // Send the file for download
  res.download(filePath, "template.xlsx", (err) => {
    if (err) {
      console.error("Error sending template:", err);
      return res.status(500).send("Error downloading template");
    }

    // Clean up the file after sending
    fs.unlink(filePath, (unlinkErr) => {
      if (unlinkErr) console.error("Error deleting template file:", unlinkErr);
    });
  });
});

module.exports = router;
