'use strict';

const { S3Client } = require('@aws-sdk/client-s3');
const config = require('../config.js');

class S3DAO {
    constructor(configuration, bucketName) {
        if (configuration !== undefined) {
            this.s3client = configuration.s3;
            this.bucketName = configuration.tableName;
        }
        if (!this.bucketName) {
            this.bucketName = bucketName;
        }
    }

    async client() {
        if (this.s3client === undefined) {
            this.s3client = new S3Client({ region: config.dynamodb.region });
        }
        return this.s3client;
    }
}

module.exports = S3DAO;