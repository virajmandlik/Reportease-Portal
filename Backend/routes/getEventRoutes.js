const express = require('express');
const router = express.Router();
const { getEvents } = require('../controllers/getEventController');

// Route to get all departments
router.get('/events/:institute_id', getEvents);

module.exports = router;
