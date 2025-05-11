const express = require("express");
const { getStudentCourses } = require("../controllers/studentController");

const router = express.Router();

// Route to fetch courses for a student
router.get("/StudentCourses", getStudentCourses);

module.exports = router;
