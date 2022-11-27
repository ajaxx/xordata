const express = require('express');
const router = express.Router();
const debug = require('debug')('xordata:page:profile');

const UserProfiles = require('../models/model_user_profile').Singleton;
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
  res.render('profile_editor', { userProfile: req.userProfile });
});

router.get('/connect/:userId', function (req, res, next) {
  const myUserId = req.userProfile.uid;
  const theirUserId = req.params.userId;
  if (theirUserId == req.userProfile.uid) {
    console.log(`userId: ${theirUserId}`);
    console.log(`otherId: ${req.userProfile.uid}`)
    res.redirect('/profile');
    return;
  }

  // Do these two already have a relationship?
  Relationships
    .get(myUserId, theirUserId)
    .then(relationship => {
      if (relationship !== undefined) {
        res.redirect(`/profile/view/${theirUserId}`);
      } else {
        // Create a relationship entity for these two
        Promise.all([
          Relationships.put({
            src_uid : myUserId,
            dst_uid : theirUserId,
            status : 'requested'
          }),
          Relationships.put({
            src_uid: theirUserId,
            dst_uid: myUserId,
            status: 'pending'
          })
        ]).then(() => {
          res.redirect(`/profile/view/${theirUserId}`);
        });
      }
    });
});

function approveOrDecline(src_status, dst_status, req, res, next) {
  const myUserId = req.userProfile.uid;
  const theirUserId = req.params.userId;
  if (theirUserId == req.userProfile.uid) {
    console.log(`userId: ${theirUserId}`);
    console.log(`otherId: ${req.userProfile.uid}`)
    res.redirect('/profile');
    return;
  }

  return Promise.all([
    Relationships.put({
      src_uid: myUserId,
      dst_uid: theirUserId,
      status: src_status
    }),
    Relationships.put({
      src_uid: theirUserId,
      dst_uid: myUserId,
      status: dst_status
    })
  ]).then(() => {
    res.redirect(`/profile/view/${theirUserId}`);
  });
};

router.get('/approve/:userId', function (req, res, next) {
  return approveOrDecline('connected', 'connected', req, res, next);
});

router.get('/decline/:userId', function (req, res, next) {
  return approveOrDecline('decliner', 'declined', req, res, next);
});

router.get('/view/:userId', function(req, res, next) {
  const myUserId = req.userProfile.uid;
  const theirUserId = req.params.userId;
  if (theirUserId == myUserId) {
    console.log(`myUserId: ${myUserId}`);
    console.log(`theirUserId: ${theirUserId}`)
    res.render('profile_editor', { userProfile: req.userProfile });
  } else {
    UserProfiles.get(theirUserId).then(viewUserProfile => {
      console.log(`myUserId: ${myUserId}`);
      console.log(`theirUserId: ${theirUserId}`)
      console.log(`viewUserProfile: ${viewUserProfile}`)
      
      if (viewUserProfile !== undefined) {
        Relationships
          .get(myUserId, theirUserId)
          .then(
            relationship => {
              console.log(relationship);
              res.render('profile_viewer', {
                userProfile: req.userProfile,
                viewUserProfile: viewUserProfile,
                relationship: relationship
              });
          });
      } else {
        res.render('profile_not_found', {
          userProfile: req.userProfile,
          userId: theirUserId
        });
      }
    });
  }
});

module.exports = router;
