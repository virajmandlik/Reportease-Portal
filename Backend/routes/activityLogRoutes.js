const express = require('express');
const router = express.Router();
const { getActivityLog } = require('../controllers/activityLogController');


// Route to get all activity logs
router.get('/activity-logs/:institute_id', getActivityLog);


module.exports = router;




