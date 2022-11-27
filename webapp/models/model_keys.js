"use strict";

const DynamoV2DAO = require('./base_dynamodb_v2');
const debug = require('debug')('xordata:dao:keys');
const crypto = require('crypto');
const openpgp = require('openpgp');

const { GetItemCommand, DeleteItemCommand, PutItemCommand, QueryCommand } = require('@aws-sdk/client-dynamodb');

const defaultTableName = 'XorData-Keys';

function itemToEntity(entity) {
    if (entity) {
        return {
            key: entity.key.S,
            uid: entity.uid.S,
            kid: entity.kid.S
        }
    }
}

/* export */ class KeysDAO extends DynamoV2DAO {
    constructor(configuration) {
        super(configuration, defaultTableName);
    }

    async findAll(uid) {
        const params = {
            TableName: this.tableName,
            KeyConditionExpression: `uid = :u`,
            ExpressionAttributeValues: { ':u': { 'S' : uid } }
        }

        const client = await this.client();
        const command = new QueryCommand(params);
        const result = await client.send(command);
        if (result.Items) {
            return result.Items.map(itemToEntity);
        }
        return [];
    }

    async getVerificationKeys(uid) {
        let keys = await this.findAll(uid);
        // map each key into its openPGP form
        return await Promise.all(keys.map(key => openpgp.readKey({ armoredKey : key.key })));
    }

    async get(uid, kid) {
        const params = {
            TableName: this.tableName,
            Key: {
                'uid': { "S": uid },
                'kid': { "S": kid }
            }
        }

        const client = await this.client();
        const command = new GetItemCommand(params);
        const result = await client.send(command);
        return itemToEntity(result.Item);
    }

    async put(uid, publicKey) {
        // Using a digital hashing algorithm ensures that if the same publicKey
        // is presented twice that it simply update the entry.
        const kid = crypto.createHash('sha256')
            .update(publicKey)
            .digest('hex');

        const params = {
            TableName: this.tableName,
            Item : {
                'uid' : { "S" : uid },
                'kid' : { "S" : kid },
                'key' : { "S" : publicKey }
            }
        }

        const client = await this.client();
        const command = new PutItemCommand(params);

        debug(`put: executing command`);
        debug(command);

        await client.send(command);
        return { uid : uid, kid : kid }
    }

    async delete(uid, kid) {
        const params = {
            TableName: this.tableName,
            Key: { 
                'uid': { "S": uid },
                'kid': { "S": kid }
             }
        }

        const client = await this.client();
        const command = new DeleteItemCommand(params);
        await client.send(command);
        return { uid: uid, kid: kid }
    }
}

const Singleton = new KeysDAO();


module.exports = {
    KeysDAO: KeysDAO,
    Singleton: Singleton,
    findAll: (uid, section) => Singleton.findAll(uid, section)
};