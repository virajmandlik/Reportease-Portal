const express = require("express");
const router = express.Router();
const { getUsernameByEmail } = require("../controllers/getMailController");


// Define the route
router.post('/get-username', getUsernameByEmail);


module.exports = router;




