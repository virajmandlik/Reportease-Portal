

const { updatePassword } = require("../controllers/updatepassController");
const express = require('express');




const router = express.Router();


// Route for updating password
router.post('/update-password', updatePassword);


module.exports = router;






