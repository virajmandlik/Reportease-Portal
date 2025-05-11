const express = require('express');
const { addOpportunity } = require('../controllers/careerOpportunitiesController');


const router = express.Router();


// POST route to add an opportunity
router.post('/add-opportunity/:username', addOpportunity);


module.exports = router;



