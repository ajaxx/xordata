const express = require('express');
const router = express.Router();

router.get('/', function (req, res, next) {
  res.clearCookie('session_token');
  res.redirect('/');
});

module.exports = router;
