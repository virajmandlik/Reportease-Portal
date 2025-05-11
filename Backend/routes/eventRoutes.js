const express = require('express');
const router = express.Router();
const { createEvent } = require('../controllers/eventController');


// Route to create a program
router.post('/create-event/:institute_id', createEvent);


module.exports = router;





