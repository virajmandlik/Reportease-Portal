const express = require('express');
const router = express.Router();
const { getAcadDepartmentNames } = require('../controllers/getAcadDeptController');


// Route to get all departments
router.get('/acadDepartmentNames/:institute_id', getAcadDepartmentNames);


module.exports = router;





