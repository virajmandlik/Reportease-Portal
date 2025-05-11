const express = require('express');
const router = express.Router();
const { getDepartmentByCoordinator } = require('../controllers/getDepartmentByCoordinatorIdController');

// Route to get the department name based on coordinator ID
router.get('/get-department-type/:userid', getDepartmentByCoordinator);

module.exports = router;
