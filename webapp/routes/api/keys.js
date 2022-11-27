const express = require('express');
const router = express.Router();
const debug = require('debug')('xordata:api:keys');
const openpgp = require('openpgp');

const KeysModel = require('../../models/model_keys').Singleton;

// Returns "all" of the keys
router.get('/', (req, res, next) => {
    KeysModel
        .findAll(req.userProfile.uid)
        .then(keys => res.json(keys))
        .catch(error => next(error));
});

// Returns a specific key
router.get('/:keyId', (req, res, next) => {
    KeysModel
        .get(req.userProfile.uid, req.params.keyId)
        .then(key => res.json(key))
        .catch(error => next(error));
});

// Registers a (new) public key with the service
router.post('/', express.json(), (req, res, next) => {
    // we will take the publicKey as it - we need to add verification
    const publicKey = req.body.publicKey;
    if (publicKey) {
        KeysModel
            .put(req.userProfile.uid, publicKey)
            .then(result => res.json(result))
            .catch(error => next(error));
    } else {
        res.sendStatus(401);
    }
});

router.delete('/:keyId', (req, res, next) => {
    KeysModel
        .delete(req.userProfile.uid, req.params.keyId)
        .then(id => res.json({ id: id }))
        .catch(error => next(error));
});

// Generate a keypair
router.post('/keypair', express.json(), (req, res, next) => {
    // the request must be authorized
    const userProfile = req.userProfile;

    const type = 'ecc';
    const curve = 'curve25519';
    const passphrase = req.body.passphrase;

    const userID = { email: userProfile.email };
    if (userProfile.display_name) {
        userID['name'] = userProfile.display_name;
    }
    
    openpgp.generateKey({
        type: type, // Type of the key, defaults to ECC
        curve: curve, // ECC curve name, defaults to curve25519
        userIDs: [ userID ], // you can pass multiple user IDs
        passphrase: passphrase, // protects the private key
        format: 'armored' // output key format, defaults to 'armored' (other options: 'binary' or 'object')
    }).then((response) => {
        // do not store the private key
        res.json({
            privateKey: response.privateKey,
            publicKey: response.publicKey,
            revocationCertificate: response.revocationCertificate
        });
    }).catch(error => {
        next(error);
    })
});

module.exports = router;