const express = require('express');
const router = express.Router();
const { getInstituteDetails } = require('../controllers/getInstituteController');

// Route to get institute details by username
router.get('/get-institute/:username', getInstituteDetails);

module.exports = router;
