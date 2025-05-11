const express = require("express");
const { getUserDetails } = require("../controllers/userController");
const { verifyToken } = require("../middleware/authMiddleware");
const router = express.Router();
const userController = require('../controllers/userController')
router.get("/details", verifyToken, getUserDetails);

router.get('/user/:id', userController.getUserById);
router.put('/user/:userid', userController.updateUser);

module.exports = router;
