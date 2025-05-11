const express = require('express');
const { deleteInfra } = require('../controllers/deleteInfraController');
const router = express.Router();

// DELETE route to delete a department by ID
router.delete('/delete-infrastructure/:infra_id', deleteInfra);

module.exports = router;
