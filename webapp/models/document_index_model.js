"use strict";

const DynamoDAO = require('./base_dynamodb');
const dao_validation = require('./validation');
const debug = require('debug')('xordata:dao:document-index');

const defaultTableName = 'XorData-DocumentIndex';

/* export */ class DocumentIndexDAO extends DynamoDAO {
    constructor(configuration) {
        super(configuration, defaultTableName);
    }

    async get(uid) {
        let parameters = {
            TableName: this.tableName,
            Key: { "uid": { "S" : uid } }
        }

        debug(`lookup for ${uid}`)
        let dynamo = await this.client();
        return dynamo
            .getItem(parameters).promise()
            .then(data => {
                // Expected return value (if found):
                // {
                //   Item: {
                //     uid: { S: '4da4815b-57e1-4d10-8a2f-c70c88265474' },
                //     user: { S: 'username' },
                //     email: { S: 'email@domain' },
                //     display_name: { S: 'some-name' },
                //     timestamp: { S: '2021-06-27T21:53:17.784Z' }
                //   }
                // }
                
                let itemData = data.Item;
                if (itemData) {
                    debug(`lookup for ${uid}: converting from itemData`)
                    return itemToUserProfile(itemData);
                }

                debug(`lookup for ${uid}: found nothing`)
                return undefined;
            });
    }

    async put(documentIndex) {
        let dynamo = await this.client();
        let profileAsItem = {
            "uid": { "S": documentIndex.uid },
            "section": { "S": documentIndex.section },
            "email" : { "S" : documentIndex.email || '' },
            "timestamp": { "S": (new Date()).toISOString() },
        };

        if (documentIndex.display_name) {
            profileAsItem["display_name"] = { "S" : documentIndex.display_name };
        }

        debug(`put(): writing profile as ${JSON.stringify(profileAsItem)}`);

        let parameters = {
            TableName: this.tableName,
            Item: profileAsItem
        };

        return dynamo
            .putItem(parameters).promise()
            .then(data => documentIndex.uid);
    }

    async getOrCreate(uid, userProfileSupplier) {
        debug(`getOrCreate(): checking for ${uid}`)
        let index = await this.get(uid);
        if (index === undefined) {
            index = userProfileSupplier(uid);
            await this.put(index);
        }
        return index;
    }
}

exports.DocumentIndexDAO = DocumentIndexDAO;
exports.Singleton = (function(){
    var instance;
    return {
        setInstance : function(value) {
            instance = value;
        },
        getInstance : function(){
            if(!instance) {  // check already exists
                instance = new DocumentIndexDAO();
            }
            return instance;
        }
    }
})();
