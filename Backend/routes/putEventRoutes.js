const express = require('express');
const router = express.Router();
const { putEventChanges } = require('../controllers/updateEventController');

// Route to get all departments
router.put('/update-event/:event_id', putEventChanges);

module.exports = router;
