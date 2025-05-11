const express = require('express');
const { deleteClub } = require('../controllers/deleteClubController');
const router = express.Router();

// DELETE route to delete a department by ID
router.delete('/delete-club/:club_id', deleteClub);

module.exports = router;
