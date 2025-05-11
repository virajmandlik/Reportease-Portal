const express = require('express');
const router = express.Router();
const { submitFacultyFeedback } = require('../controllers/facultyFeedbackController');

// Route to register institute admin
router.post('/submit-feedback', submitFacultyFeedback);



module.exports = router;