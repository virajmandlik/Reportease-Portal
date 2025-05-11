const express = require('express');
const router = express.Router();
const { putInfraChanges } = require('../controllers/updateInfraController');

// Route to get all departments
router.put('/update-infrastructure/:infra_id', putInfraChanges);

module.exports = router;
