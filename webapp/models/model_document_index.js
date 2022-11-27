"use strict";

const DynamoV2DAO = require('./base_dynamodb_v2');
const debug = require('debug')('xordata:dao:index');

const { GetItemCommand, DeleteItemCommand, PutItemCommand, QueryCommand } = require('@aws-sdk/client-dynamodb');

const defaultTableName = 'XorData-Documents';

function itemToEntity(entity) {
    if (entity) {
        return {
            uid: entity.uid.S,
            oid: entity.oid.S,
            section: entity.section.S,
            description: entity.description.S,
            timestamp: entity.timestamp.S
        }
    }
}

/* export */ class DocumentIndexDAO extends DynamoV2DAO {
    constructor(configuration) {
        super(configuration, defaultTableName);
    }

    async findAll(uid, section) {
        let keyConditionExpression = 'uid = :u';
        let expressionAttributeValues = { ':u': { 'S': uid } }
        let expressionAttributeNames = { }

        if (section) {
            keyConditionExpression += ' AND #sc = :s';
            expressionAttributeValues[':s'] = { 'S' : section }
            expressionAttributeNames['#sc'] = 'section';
        }

        const params = {
            TableName: this.tableName,
            KeyConditionExpression: keyConditionExpression,
            ExpressionAttributeValues: expressionAttributeValues,
        }

        if (section) {
            params['IndexName'] = 'uid-section-index';
            params['ScanIndexForward'] = false;
        }

        if (Object.keys(expressionAttributeNames) != 0) {
            params['ExpressionAttributeNames'] = expressionAttributeNames;
        }

        const client = await this.client();
        const command = new QueryCommand(params);
        const result = await client.send(command);
        if (result.Items) {
            return result.Items.map(itemToEntity);
        }
        return [];
    }

    async get(uid, oid) {
        const params = {
            TableName: this.tableName,
            Key: {
                'uid': { "S": uid },
                'oid': { "S": oid }
            }
        }

        const client = await this.client();
        const command = new GetItemCommand(params);
        const result = await client.send(command);
        return itemToEntity(result.Item);
    }

    async put(index) {
        const params = {
            TableName: this.tableName,
            Item : {
                'uid' : { "S" : index.uid },
                'oid' : { "S": index.oid },
                'section' : { "S" : index.section },
                'description' : { "S": index.description },
                'timestamp' : { "S" : index.timestamp },
            }
        }

        const client = await this.client();
        const command = new PutItemCommand(params);

        await client.send(command);
        return index;
    }

    async delete(uid, oid) {
        const params = {
            TableName: this.tableName,
            Key: { 
                'uid': { "S": uid },
                'oid': { "S": oid }
             }
        }

        const client = await this.client();
        const command = new DeleteItemCommand(params);
        await client.send(command);
        return { uid: uid, oid: oid }
    }
}

const Singleton = new DocumentIndexDAO();

module.exports = {
    DocumentIndexDAO: DocumentIndexDAO,
    Singleton: Singleton,
    findAll: (uid, section) => Singleton.findAll(uid, section)
};