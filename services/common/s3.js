'use strict';

const AWS = require('aws-sdk');
const config = require('./config.js');

module.exports = {
    getClient: async function () {
        return new AWS.S3({region: config.s3.region});
    }
}
