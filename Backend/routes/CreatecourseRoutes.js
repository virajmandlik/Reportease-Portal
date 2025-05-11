const express = require("express");
const router = express.Router();
const { addCourse } = require("../controllers/CreatecourseController"); // Adjust the path as necessary

// Route to add a course
router.post("/add", addCourse);

module.exports = router;
