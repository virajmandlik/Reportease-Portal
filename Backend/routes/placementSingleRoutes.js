const express = require('express');
const router = express.Router();
const  {addPlacement}  = require('../controllers/placementSingleController.js');


// POST route to add a placement
router.post('/placements/single', addPlacement);

module.exports = router;