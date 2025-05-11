const express = require('express');
const router = express.Router();
const { createProgram } = require('../controllers/programController');


// Route to create a program
router.post('/create-program/:username', createProgram);


module.exports = router;






