const express = require('express');
const router = express.Router();
const { getClubNames } = require('../controllers/getClubNameController');


// Route to get all departments
router.get('/clubNames/:institute_id', getClubNames);


module.exports = router;


