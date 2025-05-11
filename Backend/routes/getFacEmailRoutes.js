const express = require('express');
const router = express.Router();
const { getFacultyEmails } = require('../controllers/getFacEmailController');

// Route to get all departments
router.get('/facultyEmails/:institute_id', getFacultyEmails);

module.exports = router;
