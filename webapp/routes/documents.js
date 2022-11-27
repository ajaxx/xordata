const express = require('express');
const router = express.Router();
const debug = require('debug')('xordata:page:documents');
const sections = require('../models/model_sections');

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
