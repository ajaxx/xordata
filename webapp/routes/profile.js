const express = require('express');
const router = express.Router();
const debug = require('debug')('xordata:page:profile');

const UserProfiles = require('../models/model_user_profile').Singleton;

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
  res.render('profile_editor', { userProfile: req.userProfile });
});

router.get('/:userId', function(req, res, next) {
  const userId = res.params.userId;
  if (userId == req.userProfile.uid) {
    res.render('profile_editor', { userProfile: req.userProfile });
  } else {
    const viewUserProfile = UserProfiles.get(userId);
    if (viewUserProfile) {
      res.render('profile_viewer', { userProfile: req.userProfile, viewUserProfile: viewUserProfile });
    } else {
      res.render('profile_not_found', { userProfile: req.userProfile, userId: userId });
    }
  }
});

module.exports = router;
