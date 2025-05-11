const express = require('express');
const { deleteEvent } = require('../controllers/deleteEventController');
const router = express.Router();

// DELETE route to delete a department by ID
router.delete('/delete-event/:event_id', deleteEvent);

module.exports = router;
