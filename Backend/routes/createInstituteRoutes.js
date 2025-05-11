const express = require('express');
const router = express.Router();
const { createInstitute } = require('../controllers/createInstituteController');

// Route to create an institute and update user association
router.post('/create-institute', createInstitute);

module.exports = router;
