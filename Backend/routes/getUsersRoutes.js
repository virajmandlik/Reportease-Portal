const express = require('express');
const router = express.Router();
const { getUsers } = require('../controllers/getUsersController');

// Route to get all departments
router.get('/users/:institute_id', getUsers);

module.exports = router;
