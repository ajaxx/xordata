const express = require('express');
const router = express.Router();
const debug = require('debug')('xordata:api');

router.use(require('../session'));
router.use(function(req, res, next) {
  debug('api call invoked');
  if (!req.userProfile) {
    debug('api called without credentials');
    res.status(401).end();
  } else {
    next();
  }
});

router.use('/documents', require('./api/documents'));
router.use('/sections', require('./api/sections'));

module.exports = router;