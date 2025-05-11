const express = require('express');
const router = express.Router();
const { registerInstituteAdmin } = require('../controllers/registerInstAdminController');

// Route to register institute admin
router.post('/register/institute-admin', registerInstituteAdmin);

module.exports = router;
