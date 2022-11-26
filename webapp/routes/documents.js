const express = require('express');
const router = express.Router();
const debug = require('debug')('xordata:page:documents');

let sections = [
  { 'key' : 'patient', 'title': 'Patient', 'icon': 'fa-hospital-user' },
  { 'key' : 'procedures', 'title': 'Procedures', 'icon': 'fa-heart-pulse' },
  { 'key' : 'medication', 'title': 'Medication', 'icon': 'fa-prescription' },
  { 'key' : 'questions', 'title': 'Questions & Answers', 'icon': 'fa-clipboard-question'},
  { 'key' : 'service_requests', 'title': 'Service Requests', 'icon': 'fa-book-medical'}
];

router.get('/', (req, res) => {
  if (req.userProfile !== undefined) {
    res.render('documents', { userProfile: req.userProfile, sections: sections });
  } else {
    res.redirect('/');
  }
});

module.exports = router;
