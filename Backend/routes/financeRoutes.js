const express = require('express');
const router = express.Router();
const { getDepartmentNames } = require('../controllers/financeController');
const { getInfrastructureNames } = require('../controllers/financeController');
const { getEventNames } = require('../controllers/financeController');


router.get('/departmentNames/:institute_id', getDepartmentNames);
router.get('/infrastructureNames/:institute_id', getInfrastructureNames);
router.get('/eventNames/:institute_id', getEventNames);


module.exports = router;



