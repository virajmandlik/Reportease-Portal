const express = require('express');
const router = express.Router();
const { getClubs } = require('../controllers/getClubController');

// Route to get all departments
router.get('/clubs/:institute_id', getClubs);

module.exports = router;
