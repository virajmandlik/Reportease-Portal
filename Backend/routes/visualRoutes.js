const express = require('express');
const router = express.Router();
const { getDepartmentWiseStudentCount, getDepartmentWiseFacultyCount, getTypeWiseClubCount, getTypeWiseEventCount, getFinanceData, getAchievementsData, getPlacementData } = require('../controllers/visualController');

// Route to create a program
router.get('/get-deptwise-student-count/:institute_id', getDepartmentWiseStudentCount);
router.get('/get-deptwise-faculty-count/:institute_id', getDepartmentWiseFacultyCount);
router.get('/get-typewise-club-count/:institute_id', getTypeWiseClubCount);
router.get('/get-typewise-event-count/:institute_id', getTypeWiseEventCount); 
router.get('/get-finance-data/:institute_id', getFinanceData);
router.get('/get-achievements-data/:institute_id', getAchievementsData);
router.get('/get-placement-data/:institute_id', getPlacementData);

module.exports = router;