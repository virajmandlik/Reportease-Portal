const express = require('express');
const { deleteDepartment } = require('../controllers/deleteDeptController');
const router = express.Router();

// DELETE route to delete a department by ID
router.delete('/delete-department/:department_id', deleteDepartment);

module.exports = router;
