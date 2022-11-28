const express = require('express');
const router = express.Router();
const formidable = require('formidable');
const fs = require('fs');
const debug = require('debug')('xordata:page:documents');
const uuid = require('uuid');

const controller_reindex = require('../../controllers/reindex');

const DocumentModel = require('../../models/model_document').Singleton;
const DocumentIndexModel = require('../../models/model_document_index').Singleton;
const UserProfileModel = require('../../models/model_user_profile').Singleton;
const KeysModel = require('../../models/model_keys').Singleton;
const GrantModel = require('../../models/model_grants').Singleton;
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
                    timestamp: result.timestamp,
                    dockey: result.dockey,
                    kek: result.kek
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

router.post('/share', express.json(), (req, res, next) => {
    console.log(req.body);
    const grant = {
        src_uid: req.userProfile.uid,
        dst_uid: req.body.dst_uid,
        oid: req.body.oid,
        kek: req.body.kek
    }

    if (grant.src_uid &&
        grant.dst_uid &&
        grant.oid &&
        grant.kek) {
        GrantModel
            .put(grant)
            .then(result => res.json(result))
            .catch(error => next(error));
    } else {
        console.log(grant);
        res.sendStatus(400);
    }
});

router.get('/share/:docId/:dstId', (req, res, next) => {
    const srcId = req.userProfile.uid;
    const docId = req.params.docId;
    const dstId = req.params.dstId;
    if (srcId && dstId && docId) {
        UserProfileModel.get(dstId).then(async dstUserProfile => {
            const keys = await KeysModel.findAll(dstId);

            // Verify the index for the document (as it must belong to the current caller)
            const index = await DocumentIndexModel.get(srcId, docId);
            res.json({
                kek: index.kek,
                description: index.description,
                destination: {
                    uid: dstUserProfile.uid,
                    user: dstUserProfile.user,
                    key: keys[0].key
                }
            });
        }).catch(error => next(error));
    } else {
        res.sendStatus(400);
    }
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