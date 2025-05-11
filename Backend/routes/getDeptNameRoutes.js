const express = require('express');
const router = express.Router();
const { getDepartmentNames } = require('../controllers/getDeptNameController');


// Route to get all departments
router.get('/departmentNames/:institute_id', getDepartmentNames);


module.exports = router;



