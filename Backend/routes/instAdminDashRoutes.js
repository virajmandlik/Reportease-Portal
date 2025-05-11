const express = require('express');
const { countStudents, countFaculty, countPrograms, countDepartments, countClubs, countEvents } = require('../controllers/instAdminDashController');


const router = express.Router();


router.get('/admin/count-students/:username', countStudents);
router.get('/admin/count-faculty/:username', countFaculty);
router.get('/admin/count-departments/:username', countDepartments);
router.get('/admin/count-programs/:username', countPrograms);
router.get('/admin/count-clubs/:username', countClubs);
router.get('/admin/count-events/:username', countEvents);


module.exports = router;




