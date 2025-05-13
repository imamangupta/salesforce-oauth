var express = require('express');
var router = express.Router();

const salesforce = require('./salesforce');
router.use('/v1', salesforce);

module.exports = router;