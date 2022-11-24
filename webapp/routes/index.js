const express = require('express');
const router = express.Router();
const debug = require('debug')('xordata:pages:index');

/* GET home page. */
router.get('/', function(req, res, next) {
  // See if we have a session
  if (req.userProfile !== undefined) {
    res.render('index', { userProfile: req.userProfile, session: req.session });
  } else {
    res.render('index', { })
  }
});

module.exports = router;
