const express = require('express');
const router = express.Router();
const debug = require('debug')('xordata:page:connections');

const Relationships = require('../models/model_relationship').Singleton;

router.use(require('../auth_jwt'));
router.use(function (req, res, next) {
  debug('api call invoked');
  if (!req.userProfile) {
    res.redirect('/');
  } else {
    next();
  }
});

router.get('/', function(req, res, next) {
  const myUserId = req.userProfile.uid;

  Relationships
    .findAll(myUserId)
    .then(relationships => {
      res.render('connections', {
        userProfile: req.userProfile,
        relationships: relationships
      });
    })
    .catch(error => next(error));
});

module.exports = router;
