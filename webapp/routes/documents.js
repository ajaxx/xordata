const express = require('express');
const router = express.Router();
const debug = require('debug')('xordata:page:documents');
const sections = require('../models/model_sections');

const IndexModel = require('../models/model_document_index').Singleton;
const UserProfileModel = require('../models/model_user_profile').Singleton;

router.use(require('../auth_jwt'));
router.use(function (req, res, next) {
  debug('api call invoked');
  if (!req.userProfile) {
    res.status(401).end();
  } else {
    next();
  }
});

router.get('/', (req, res) => {
  res.render('documents', { userProfile: req.userProfile });
});

router.get('/share/:docId/:dstId', (req, res, next) => {
  const srcId = req.userProfile.uid;
  const docId = req.params.docId;
  const dstId = req.params.dstId;
  if (srcId && dstId && docId) {
    res.render('share', {
      documentId: docId,
      destinationUser: dstId,
      userProfile: req.userProfile
    });
  } else {
    res.sendStatus(400);
  }
});

router.get('/view/:docId/:dstId', (req, res, next) => {
  const srcId = req.userProfile.uid;
  const docId = req.params.docId;
  const dstId = req.params.dstId;
  if (srcId && dstId && docId) {
    res.render('document_view', {
      documentId: docId,
      destinationUser: dstId,
      userProfile: req.userProfile
    });
  } else {
    res.sendStatus(400);
  }
});

router.get('/upload', (req, res) => {
  const section = req.query.section;
  if (section && sections.isSection(section)) {
    res.render('document_uploader', {
      userProfile: req.userProfile,
      section: section
    });
  } else {
    res.sendStatus(400);
  }
});

router.get('/:documentId', (req, res) => {
  const documentId = req.params.documentId;
  res.render('document_properties', { userProfile: req.userProfile, documentId: documentId });
});

module.exports = router;
