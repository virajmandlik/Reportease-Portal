const express = require('express');
const router = express.Router();
const { putClubChanges } = require('../controllers/updateClubController');

// Route to get all departments
router.put('/update-club/:club_id', putClubChanges);

module.exports = router;
