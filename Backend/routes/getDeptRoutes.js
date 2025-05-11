const express = require('express');
const router = express.Router();
const { getDepartments } = require('../controllers/getDeptController');

// Route to get all departments
router.get('/departments', getDepartments);

module.exports = router;
