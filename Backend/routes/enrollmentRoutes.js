const express = require("express");
const { enrollStudent } = require("../controllers/enrollmentController");

const router = express.Router();

// Route to enroll a student in courses
router.post("/enroll", enrollStudent);

module.exports = router;
