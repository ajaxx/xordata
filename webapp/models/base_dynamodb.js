const db = require('../db');

class DynamoDAO {
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
            this.dynamodb = await db.dynamodb.getClient();
        }
        return this.dynamodb;
    }
}

module.exports = DynamoDAO;