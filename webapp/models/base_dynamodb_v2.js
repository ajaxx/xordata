'use strict';

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const config = require('../config.js');

class DynamoV2DAO {
    constructor(configuration, defaultTableName) {
        if (configuration !== undefined) {
            this.dynamodb = configuration.dynamodb;
            this.tableName = configuration.tableName;
        }
        if (!this.tableName) {
            this.tableName = defaultTableName;
        }
    }

    async client() {
        if (this.dynamodb === undefined) {
            this.dynamodb = new DynamoDBClient({ region: config.dynamodb.region });
        }
        return this.dynamodb;
    }
}

module.exports = DynamoV2DAO;