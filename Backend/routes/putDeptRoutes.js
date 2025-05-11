const express = require('express');
const router = express.Router();
const { putDeptChanges } = require('../controllers/updateDeptController');

// Route to get all departments
router.put('/update-department/:department_id', putDeptChanges);

module.exports = router;
