const express = require('express');
const router = express.Router();
const { createFinance } = require('../controllers/postFinanceController');


// Route to create a program
router.post('/create-finance/:institute_id', createFinance);


module.exports = router;





