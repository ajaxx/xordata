const express = require('express');
const router = express.Router();
const formidable = require('formidable');
const sections = require('../../models/sections_model');
const fs = require('fs');
const debug = require('debug')('xordata:page:documents');
const uuid = require('uuid');

const controller_reindex = require('../../controllers/reindex');

const DocumentModel = require('../../models/document_model').Singleton;

/**
 * Returns the documents visible to this user.
 */
router.get('/', (req, res, next) => {
    // Access the provided section and limit query parameters
    const section = req.query.section;
    const uid = req.userProfile.uid;
    const limit = req.query.limit || 100;

    DocumentModel
        .findAll(uid, section)
        .then((documents) => {
            res.json(documents);
        })
        .catch(error => next(error));
});

router.post('/', (req, res, next) => {
    debug('post request incoming');

    const uid = req.userProfile.uid;

    const form = formidable();
    form.uploadDir = `./uploads/`;
    form.keepExtensions = false;
    form.multiples = false;

    form.parse(req, (err, fields, files) => {
        if (err) {
            next(err);
            return;
        }

        const section = fields['section'];
        if (!sections.isSection(section)) {
            res.status(400);
            return;
        }

        if (!('dataFile' in files)) {
            res.status(400);
            return;
        }

        const file = files['dataFile'];
        const pathToFile = file.filepath;
        fs.readFile(pathToFile, 'utf8', function(err, data) {
            // send the file to s3
            if (err) {
                next(err);
                return;
            }

            const id = uuid.v4();
            DocumentModel.put({
                id: id,
                uid: uid,
                section: section,
                content: data
            });

            res.json({ id : id, status : 'complete' });
        });
    });
});

/**
 * Reindexes the documents for this user
 */
router.post('/reindex', (req, res, next) => {
    debug('post request to reindex');
    const uid = req.userProfile.uid;
    controller_reindex(uid)
        .then(() => {
            res.json({ 'status' : 'reindex-complete' });
        }).catch((error) => {
            next(error);
        });
});

module.exports = router;