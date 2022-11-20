"use strict";

const AWS = require('aws-sdk');

// in a development environment, these values can be set as environment variables
// in a production environment, these values need to be resolvable

let appRegion = process.env.REGION || 'us-east-2';

exports.dynamodb = {
    region: appRegion
};

exports.sns = {
    region: appRegion
};

exports.sqs = {
    region: appRegion
};

exports.s3 = {
    region: appRegion
};

module.exports = exports;
