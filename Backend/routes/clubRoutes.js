const express = require('express');
const router = express.Router();
const { createClub } = require('../controllers/clubController');


// Route to create a program
router.post('/create-club/:institute_id', createClub);


module.exports = router;






