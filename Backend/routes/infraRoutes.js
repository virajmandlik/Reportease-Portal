const express = require('express');
const router = express.Router();
const { createInfrastructure } = require('../controllers/infraController');


// Route to create a program
router.post('/create-infrastructure/:institute_id', createInfrastructure);


module.exports = router;





