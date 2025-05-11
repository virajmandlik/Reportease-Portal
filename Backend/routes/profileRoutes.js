// routes/profileRoutes.js

const express = require('express');
const router = express.Router();
const { uploadProfilePhoto, upload } = require('../controllers/profileController');

// Route to handle profile photo upload
router.post('/upload-profile-photo', upload.single('photo'), uploadProfilePhoto);

module.exports = router;
