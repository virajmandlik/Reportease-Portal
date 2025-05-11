const express = require('express');
const router = express.Router();
const { createDepartment } = require('../controllers/departmentController');

// Route to create a department
router.post('/create-department', createDepartment);

module.exports = router;
