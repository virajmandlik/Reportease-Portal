const express = require('express');
const router = express.Router();
const { createAchievement } = require('../controllers/achievementController');


// Route to create a program
router.post('/create-achievement/:username', createAchievement);


module.exports = router;






