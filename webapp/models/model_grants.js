"use strict";

const DynamoV2DAO = require('./base_dynamodb_v2');
const debug = require('debug')('xordata:dao:index');

const { GetItemCommand, DeleteItemCommand, PutItemCommand, QueryCommand } = require('@aws-sdk/client-dynamodb');

const defaultTableName = 'XorData-Grants';

function itemToEntity(entity) {
    if (entity) {
        return {
            src_uid: entity.src_uid.S,
            dst_uid: entity.dst_uid.S,
            oid: entity.oid.S,
            kek: entity.kek.S,
            timestamp: entity.timestamp.S
        }
    }
}

/* export */ class GrantsDAO extends DynamoV2DAO {
    constructor(configuration) {
        super(configuration, defaultTableName);
    }

    async findByOwner(uid, oid) {
        let keyConditionExpression = 'src_uid = :u';
        let expressionAttributeValues = { ':u': { 'S': uid } }

        const params = {
            TableName: this.tableName,
            IndexName: 'src_uid-index',
            KeyConditionExpression: keyConditionExpression,
            ExpressionAttributeValues: expressionAttributeValues,
        }

        if (oid) {
            params.ExpressionAttributeValues[':o'] = { 'S' : oid };
            params.FilterExpression = 'oid = :o'
        }

        const client = await this.client();
        const command = new QueryCommand(params);
        const result = await client.send(command);
        if (result.Items) {
            return result.Items.map(itemToEntity);
        }
        return [];
    }

    async findByDestination(uid) {
        let keyConditionExpression = 'dst_uid = :u';
        let expressionAttributeValues = { ':u': { 'S': uid } }

        const params = {
            TableName: this.tableName,
            KeyConditionExpression: keyConditionExpression,
            ExpressionAttributeValues: expressionAttributeValues
        }

        const client = await this.client();
        const command = new QueryCommand(params);
        const result = await client.send(command);
        if (result.Items) {
            return result.Items.map(itemToEntity);
        }
        return [];
    }

    async get(dst_uid, oid) {
        const params = {
            TableName: this.tableName,
            Key: {
                'dst_uid': { "S": dst_uid },
                'oid': { "S": oid }
            }
        }

        const client = await this.client();
        const command = new GetItemCommand(params);
        const result = await client.send(command);
        return itemToEntity(result.Item);
    }

    async put(grant) {
        const timestamp = (new Date()).toISOString();
        const params = {
            TableName: this.tableName,
            Item : {
                'src_uid' : { "S" : grant.src_uid },
                'dst_uid' : { "S": grant.dst_uid },
                'oid' : { "S": grant.oid },
                'kek' : { "S" : grant.kek },
                'timestamp' : { "S" : timestamp }
            }
        }

        const client = await this.client();
        const command = new PutItemCommand(params);

        await client.send(command);
        return grant;
    }

    async delete(dst_uid, oid) {
        const params = {
            TableName: this.tableName,
            Key: { 
                'dst_uid': { "S": dst_uid },
                'oid': { "S": oid }
             }
        }

        const client = await this.client();
        const command = new DeleteItemCommand(params);
        await client.send(command);
        return { dst_uid: dst_uid, oid: oid }
    }
}

const Singleton = new GrantsDAO();

module.exports = {
    Singleton: Singleton,
};