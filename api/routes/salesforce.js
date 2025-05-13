var express = require('express');
var router = express.Router();
const { authtoken} = require('../controller/salesforce/salesforce');


router.post('/login', authtoken);


module.exports = router;