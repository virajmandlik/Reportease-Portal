const express = require('express');
const router = express.Router();
const { setInstituteDetails } = require('../controllers/setInstituteController');

// Route to update institute details
router.put('/set-institute/:username', setInstituteDetails);

module.exports = router;
