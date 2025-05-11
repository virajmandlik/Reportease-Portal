const express = require('express');
const router = express.Router();
const { toggleUserStatus } = require('../controllers/toggleUserStatusController');

// Route to get all departments
router.put('/toggle-user-status/:user_id', toggleUserStatus);

module.exports = router;
