const config = require('../config');
const express = require('express');
const router = express.Router();

router.get('/', function (req, res, next) {
  const client_id = config.client_id;
  const domain = config.domain;
  const callback_url = encodeURIComponent(config.callback_url);
  console.log(`callback_url: ${callback_url}`);
  res.redirect(`https://${domain}/login?response_type=code&client_id=${client_id}&redirect_uri=${callback_url}`);
});

module.exports = router;
