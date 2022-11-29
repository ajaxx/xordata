const config = require('../config')['cognito'];
const express = require('express');
const router = express.Router();
const axios = require('axios');
const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');
const UserProfileModel = require('../models/model_user_profile').Singleton;

const debug = require('debug')('xordata:authorization');

const default_scope = 'profile';
const default_grant_type = 'authorization_code';

function getSigningKey(kid) {
  // https://docs.aws.amazon.com/cognito/latest/developerguide/amazon-cognito-user-pools-using-tokens-verifying-a-jwt.html#amazon-cognito-user-pools-using-tokens-step-1
  const client = jwksClient({
    jwksUri: `https://cognito-idp.${config.region}.amazonaws.com/${config.user_pool_id}/.well-known/jwks.json`,
    cache: true
  });
  // Promise
  return client.getSigningKey(kid);
}

function createUserToken(token) {
  // get the unique identifier for the user
  const uid = token.sub;
  // get the username for the user
  const username = token['cognito:username'];
  const email = token['email'];

  return jwt.sign({
    'uid': uid,
    'user': username,
    'email': email
  }, config.token_secret);
}

router.get('/', function(req, res, next) {
  // verify that the endpoint received an authorization code
  const code = req.query.code;
  if (code !== undefined) {
    // https://docs.aws.amazon.com/cognito/latest/developerguide/token-endpoint.html
    const request_endpoint = `https://${config.domain}/oauth2/token`;
    const request_params = new URLSearchParams({
      grant_type: default_grant_type,
      client_id: config.client_id,
      code: code,
      redirect_uri: config.callback_url
    })

    debug('handling incoming get request with code');

    return axios.post(request_endpoint, request_params).then(function(response) {
      let idToken = jwt.decode(response.data.id_token, { complete: true });
      let accessToken = jwt.decode(response.data.access_token);
      let refreshToken = jwt.decode(response.data.refresh_token);

      // verify that the token has not expired
      let expires_in = response.data.expires_in;

      // the id_token is a JWT token that contains claims about the user that
      // has just authenticated. however, we cannot blindly accept the claims
      // and must validate the authenticity of the id_token
      let getSigningKeyForIdToken = function(header, callback) {
        getSigningKey(header.kid).then(function (key) {
          const signingKey = key.publicKey || key.rsaPublicKey;
          callback(undefined, signingKey);
        }).catch(function(err) {
          callback(err);
        });
      };

      return new Promise((resolve, reject) => {
        jwt.verify(response.data.id_token, getSigningKeyForIdToken, function(err, decodedToken) {
          // if we encounter an error allow it to propogate
          if (err) {
            return reject(err);
          }

          // create a JWT token for the user given what we know about
          // them and issue it back as a cookie; this helps minimize
          // the round trip requests for authorization.
          const userToken = createUserToken(decodedToken);

          // create the user profile if it does not already exist
          UserProfileModel.getOrCreate(decodedToken.sub, function() {
            debug('generating user profile data');
            return {
              'uid': decodedToken.sub,
              'user': decodedToken['cognito:username'],
              'email': decodedToken.email,
              'display_name': decodedToken.given_name || ''
            }
          }).then(() => {
            res.cookie('session_token', userToken, { maxAge: 3600000 });
            res.redirect('/');
          });
        });
      });
    }).catch(function(error) {
      console.log(`error`);
      console.log(`error: ${error}`);
    });
  } else {
    res.redirect('/');
  }
});

module.exports = router;
