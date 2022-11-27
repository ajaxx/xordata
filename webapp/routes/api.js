const express = require('express');
const router = express.Router();
const debug = require('debug')('xordata:api');

const session_auth = require('../auth_jwt');

router.use(require('../auth_jwt'));
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
router.use('/keys', require('./api/keys'));

module.exports = router;