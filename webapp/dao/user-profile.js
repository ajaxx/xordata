"use strict";

const BaseDAO = require('./base').BaseDAO;
const dao_validation = require('./validation');
const debug = require('debug')('xordata:dao:user-profile');

const defaultTableName = 'XorData-UserProfile';

function itemToUserProfile(itemData) {
    debug(`converting ${itemData}`);

    return {
        uid: dao_validation.requiredString(itemData, 'uid'),
        user: dao_validation.requiredString(itemData, 'user'),
        email: dao_validation.requiredString(itemData, 'email'),
        display_name: dao_validation.optionalString(itemData, 'display_name') || '',
        timestamp: dao_validation.requiredString(itemData, 'timestamp')
    };
}

/* export */ class UserProfileDAO extends BaseDAO {
    constructor(configuration) {
        super(configuration, defaultTableName);
    }

    /**
     * Retrieves a user profile from the datastore.
     * @param uid the user id.
     * @returns {object}
     */

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

    /**
     * Stores a new user profile into the database.
     * @param userProfile the user profile details.
     * @returns {Promise<void>}
     */
    async put(userProfile) {
        let dynamo = await this.client();
        let profileAsItem = {
            "uid": { "S": userProfile.uid },
            "user": { "S": userProfile.user },
            "email" : { "S" : userProfile.email || '' },
            "timestamp": { "S": (new Date()).toISOString() },
        };

        if (userProfile.display_name) {
            profileAsItem["display_name"] = { "S" : userProfile.display_name };
        }

        debug(`put(): writing profile as ${JSON.stringify(profileAsItem)}`);

        let parameters = {
            TableName: this.tableName,
            Item: profileAsItem
        };

        return dynamo
            .putItem(parameters).promise()
            .then(data => userProfile.uid);
    }

    async getOrCreate(uid, userProfileSupplier) {
        debug(`getOrCreate(): checking for ${uid}`)
        let userProfile = await this.get(uid);
        if (userProfile === undefined) {
            userProfile = userProfileSupplier(uid);
            await this.put(userProfile);
        }
        return userProfile;
    }
}

exports.UserProfileDAO = UserProfileDAO;
exports.Singleton = (function(){
    var instance;
    return {
        setInstance : function(value) {
            instance = value;
        },
        getInstance : function(){
            if(!instance) {  // check already exists
                instance = new UserProfileDAO();
            }
            return instance;
        }
    }
})();
