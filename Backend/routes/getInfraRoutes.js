const express = require('express');
const router = express.Router();
const { getInfrastructure } = require('../controllers/getInfraController');

// Route to get all departments
router.get('/infrastructure/:institute_id', getInfrastructure);

module.exports = router;
