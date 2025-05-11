const express = require('express');
const router = express.Router();
const { addResearchData } = require('../controllers/researchController');


router.post('/create-research', addResearchData);


module.exports = router;



