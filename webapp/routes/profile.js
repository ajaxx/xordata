const express = require('express');
const router = express.Router();
const debug = require('debug')('xordata:page:profile');

router.get('/', function(req, res, next) {
  if (req.userProfile !== undefined) {
    res.render('profile', { userProfile: req.userProfile });
  } else {
    res.redirect('/');
  }
});

module.exports = router;
