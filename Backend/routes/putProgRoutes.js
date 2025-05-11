const express = require('express');
const router = express.Router();
const { putProgChanges } = require('../controllers/updateProgController');

// Route to get all departments
router.put('/update-program/:program_id', putProgChanges);

module.exports = router;
