'use strict';

const AWS = require('aws-sdk');
const config = require('./config.js');

module.exports = {
    // SQS 
    sqs: {
        getClient: async function () {
            return new AWS.SQS({region: config.sqs.region});
        }
    }
}
