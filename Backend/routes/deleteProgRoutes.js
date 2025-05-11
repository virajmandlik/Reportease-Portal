const express = require('express');
const { deleteProgram } = require('../controllers/deleteProgController');
const router = express.Router();

// DELETE route to delete a department by ID
router.delete('/delete-program/:program_id', deleteProgram);

module.exports = router;
