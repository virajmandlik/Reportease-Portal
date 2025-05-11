const express = require('express');
const router = express.Router();
const {getInstituteClubNames} =require('../controllers/getInstituteClubNamesController')

// Route to get all departments
router.get('/clubNamesOfInstitute/:institute_id', getInstituteClubNames);

module.exports = router;