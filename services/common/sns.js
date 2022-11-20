'use strict';

const AWS = require('aws-sdk');
const config = require('./config.js');

module.exports = {
    // SNS
    sns: {
        getClient: async function () {
            return new AWS.SNS({region: config.sns.region});
        }
    }
}
