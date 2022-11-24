const debug = require('debug')('xordata:session');
const config = require('./config');
const userProfiles = require('./dao/user-profile');
const jwt = require('jsonwebtoken');

function decodeAndVerifySessionToken(sessionToken) {
    return new Promise((resolve, reject) => {
        try {
            resolve(jwt.verify(sessionToken, config.token_secret));
        } catch (error) {
            reject(error);
        }
    });
}

module.exports = function (req, res, next) {
    debug('processing request');
    if (req.cookies.session_token !== undefined) {
        debug('session_token found; decoding');
        decodeAndVerifySessionToken(req.cookies.session_token)
            .then((session) => {
                debug('searching DAO for user id');
                userProfiles.Singleton.getInstance()
                    .get(session.uid)
                    .then(userProfile => {
                        req.session = session
                        req.userProfile = userProfile;
                        debug('session handler finished');
                        next();
                    }).catch((error) => {
                        debug('userProfileDAO failed: ' + error);
                        next(new Error(error));
                    });
            })
            .catch((error) => {
                debug('decodeAndVerifySessionToken() failed: ' + error);
                next(new Error(error));
            });
    } else {
        debug('session_token not found; skipping');
        next();
    }
};