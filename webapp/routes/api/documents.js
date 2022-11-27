const express = require('express');
const router = express.Router();
const formidable = require('formidable');
const fs = require('fs');
const debug = require('debug')('xordata:page:documents');
const uuid = require('uuid');

const controller_reindex = require('../../controllers/reindex');

const DocumentModel = require('../../models/model_document').Singleton;
const DocumentIndexModel = require('../../models/model_document_index').Singleton;
const sections = require('../../models/model_sections');

/**
 * Returns the documents visible to this user.
 */
router.get('/', (req, res, next) => {
    // Access the provided section and limit query parameters
    const section = req.query.section;
    const uid = req.userProfile.uid;

    DocumentIndexModel
        .findAll(uid, section)
        .then(documents => res.json({ documents: documents }))
        .catch(error => next(error));
});

router.get('/:documentId', (req, res, next) => {
    const uid = req.userProfile.uid;
    const oid = req.params.documentId;

    DocumentIndexModel
        .get(uid, oid)
        .then(document => res.json({ document: document }))
        .catch(error => next(error));
});

// Registers a (new) document with the service
router.post('/', express.json(), (req, res, next) => {
    // Construct the entity to be passed to the model
    const document = {
        uid: req.userProfile.uid,
        section: req.body.section,
        message: req.body.message,
        signature: req.body.signature,
        description: req.body.description
    }

    if (document.section && 
        document.message && 
        document.signature &&
        document.description) {
        DocumentModel
            .put(document)
            .then(async result => {
                const index = {
                    oid: result.id,
                    uid: req.userProfile.uid,
                    section: req.body.section,
                    description: req.body.description,
                    timestamp: result.timestamp
                };

                await DocumentIndexModel.put(index);
                return res.json(result);
            })
            .catch(error => next(error));
    } else {
        res.sendStatus(400);
    }
});

router.delete('/:docId', (req, res, next) => {
    DocumentModel
        .delete(req.userProfile.uid, req.params.docId)
        .catch(error => next(error));
});

router.get('/access/:docId', (req, res, next) => {
    DocumentModel
        .delete(req.userProfile.uid, req.params.docId)
        .catch(error => next(error));
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