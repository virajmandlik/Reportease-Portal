const express = require('express');
const router = express.Router();
const { registerFaculty } = require('../controllers/registerFacultyController.js');

// Route to register institute admin
router.post('/register/institute-faculty', registerFaculty);

module.exports = router;