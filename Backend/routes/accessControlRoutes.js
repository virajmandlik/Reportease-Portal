const express = require('express');
const router = express.Router();
const accessControlController = require('../controllers/accessControlController');


router.get('/accper/:type_id', accessControlController.getPermissions);


router.put('/updateper/:type_id', accessControlController.updatePermissions);


router.put('/getallper', accessControlController.getPermissionsForAllTypes);


module.exports = router;




