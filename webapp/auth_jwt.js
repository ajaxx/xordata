const debug = require('debug')('xordata:auth_jwt');
const config = require('./config')['cognito'];
const jwt = require('jsonwebtoken');

const UserProfiles = require('./models/model_user_profile').Singleton;

function decodeAndVerifySessionToken(sessionToken) {
    return new Promise((resolve, reject) => {
        try {
            resolve(jwt.verify(sessionToken, config.token_secret));
        } catch (error) {
            reject(error);
        }
    });
}

function getTokenFromRequest(req) {
    // Check for an authorization header
    let authorization = req.headers.authorization;
    if (authorization) {
        if (authorization.startsWith('Bearer ')) {
            let bearer_token = authorization.substring(7, authorization.length);
            debug(`getTokenFromRequest: extracted bearer token ${bearer_token}`);
            return bearer_token;
        }
    }
    
    // Check for a bearer token in the session cookie
    let cookie_token = req.cookies.session_token;
    if (cookie_token) {
        debug(`getTokenFromRequest: extracted from session token ${cookie_token}`);
    }

    return cookie_token;
}

// Performs authentication based on an incoming JWT.  The JWT is taken from
// the session cookie.

module.exports = function (req, res, next) {
    debug('processing request');

    let token = getTokenFromRequest(req);
    if (token !== undefined) {
        debug('token found; decoding');
        decodeAndVerifySessionToken(token)
            .then((session) => {
                UserProfiles
                    .get(session.uid)
                    .then(userProfile => {
                        req.session = session
                        req.userProfile = userProfile;
                        debug('authorizer finished');
                        next();
                    }).catch((error) => {
                        debug('UserProfiles failed: ' + error);
                        next(new Error(error));
                    });
            })
            .catch((error) => {
                debug('authorizer finished: decodeAndVerifySessionToken() failed: ' + error);
                next(new Error(error));
            });
    } else {
        debug('authorizer finished: token not present; skipping');
        next();
    }
};