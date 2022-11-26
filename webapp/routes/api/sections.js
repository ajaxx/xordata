const express = require('express');
const router = express.Router();
const debug = require('debug')('xordata:api:sections');

let sections = [
    { 'key': 'patient', 'title': 'Patient', 'icon': 'fa-hospital-user' },
    { 'key': 'procedures', 'title': 'Procedures', 'icon': 'fa-heart-pulse' },
    { 'key': 'medication', 'title': 'Medication', 'icon': 'fa-prescription' },
    { 'key': 'questions', 'title': 'Questions & Answers', 'icon': 'fa-clipboard-question' },
    { 'key': 'service_requests', 'title': 'Service Requests', 'icon': 'fa-book-medical' }
];

/**
 * Returns the sections that can be viewed.
 */

router.get('/', (req, res) => {
    res.json({ sections: sections });
});

module.exports = router;