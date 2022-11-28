const express = require('express');
const router = express.Router();
const debug = require('debug')('xordata:api:grants');
const _ = require('lodash');

const GrantsModel = require('../../models/model_grants').Singleton;
const RelationshipModel = require('../../models/model_relationship').Singleton;
const DocumentIndexModel = require('../../models/model_document_index').Singleton;

// Returns "all" of the grants
router.get('/src', (req, res, next) => {
    GrantsModel
        .findByOwner(req.userProfile.uid)
        .then(grants => res.json(grants))
        .catch(error => next(error));
});

// Returns "all" of the grants
router.get('/dst', (req, res, next) => {
    // We augment the grant information a little when it is going this direction
    GrantsModel
        .findByDestination(req.userProfile.uid)
        .then(async grants => {
            let grants_final = await Promise.all(grants.map(async grant => {
                let index = await DocumentIndexModel.get(grant.src_uid, grant.oid);
                grant.description = index.description;
                return grant;
            }));
            return res.json(grants_final);
        })
        .catch(error => next(error));
});

// Returns "all" of the grants
router.get('/index', (req, res, next) => {
    return Promise
        .all([
            RelationshipModel.findAll(req.userProfile.uid),
            GrantsModel.findByOwner(req.userProfile.uid)
        ])
        .then(results => {
            // Organize the grants by their destination
            let grants = _.groupBy(results[1], 'dst_uid');

            // Create a dictionary for each relationship that the user has
            // and create a corresponding set of grants for that relation
            _.forEach(results[0], relation => {
                if (!(relation.dst_uid in grants)) {
                    grants[relation.dst_uid] = [];
                }
            });

            // Send the resultant object
            res.json(grants);
        });
});

// Returns all grants associated with a docId (indexed)
router.get('/index/:docId', (req, res, next) => {
    return Promise
        .all([
            RelationshipModel.findAll(req.userProfile.uid),
            GrantsModel.findByOwner(req.userProfile.uid, req.params.docId)
        ])
        .then(results => {
            // Organize the grants by their destination
            let grants = _.groupBy(results[1], 'dst_uid');
            let result = [];

            // Create a dictionary for each relationship that the user has
            // and create a corresponding set of grants for that relation
            _.forEach(results[0], relation => {
                if (!(relation.dst_uid in grants)) {
                    grants[relation.dst_uid] = [];
                }
            });

            // Send the resultant object
            res.json(grants);
        });
});


// Returns a specific grant (for me)
router.get('/:docId', (req, res, next) => {
    GrantsModel
        .get(req.userProfile.uid, req.params.docId)
        .then(grant => res.json(grant))
        .catch(error => next(error));
});


// Registers a grant with the service
router.post('/', express.json(), (req, res, next) => {
    if (res.body.dst_uid &&
        res.body.oid && 
        res.body.kek) {
        let grant = {
            src_uid: req.userProfile.uid,
            dst_uid: res.body.dst_uid,
            oid: res.body.oid,
            kek: res.body.kek
        }
        GrantsModel
            .put(grant)
            .then(result => res.json(result))
            .catch(error => next(error));
    } else {
        res.sendStatus(401);
    }
});

router.delete('/:docId', (req, res, next) => {
    GrantsModel
        .delete(req.userProfile.uid, req.params.docId)
        .then(result => res.json(result))
        .catch(error => next(error));
});

module.exports = router;