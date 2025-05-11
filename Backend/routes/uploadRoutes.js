const express = require("express");
const multer = require("multer");
const { uploadData, downloadData } = require("../controllers/uploadController");

const router = express.Router();
const upload = multer({ dest: "uploads/" });

// Route to handle uploads
router.post("/upload", upload.single("file"), (req, res) => {
  const { course_id } = req.body; // Get course_id from request body

  console.log("Received Course ID:", course_id);
  if (!course_id) return res.status(400).send("Course ID is required");

  uploadData(req.file.path, course_id)
    .then(() => res.send("Data uploaded and stored in database"))
    .catch((err) => {
      console.error("Error uploading data:", err);
      res.status(500).send("Error uploading data");
    });
});

// Route to handle downloads
router.get("/download", (req, res) => {
  const { course_id } = req.query; // Get course_id from query params
  if (!course_id) return res.status(400).send("Course ID is required");

  downloadData(res, course_id);
});

module.exports = router;
