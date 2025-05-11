const express = require('express');
const router = express.Router();
const { getPrograms } = require('../controllers/getProgController');

// Route to get all departments
router.get('/programs/:institute_id', getPrograms);

module.exports = router;
