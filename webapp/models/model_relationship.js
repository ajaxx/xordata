"use strict";

const DynamoV2DAO = require('./base_dynamodb_v2');
const debug = require('debug')('xordata:dao:index');

const { GetItemCommand, DeleteItemCommand, PutItemCommand, QueryCommand } = require('@aws-sdk/client-dynamodb');

const defaultTableName = 'XorData-Relationship';

function itemToEntity(entity) {
    if (entity) {
        return {
            src_uid: entity.src_uid.S,
            dst_uid: entity.dst_uid.S,
            status : entity.status.S,
            timestamp : entity.timestamp.S
        }
    }
}

/* export */ class RelationshipDAO extends DynamoV2DAO {
    constructor(configuration) {
        super(configuration, defaultTableName);
    }

    async findAll(uid) {
        let keyConditionExpression = 'src_uid = :u';
        let expressionAttributeValues = { ':u': { 'S': uid } }
        let expressionAttributeNames = { }

        const params = {
            TableName: this.tableName,
            KeyConditionExpression: keyConditionExpression,
            ExpressionAttributeValues: expressionAttributeValues,
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

    async get(src, dst) {
        const params = {
            TableName: this.tableName,
            Key: {
                'src_uid': { "S": src },
                'dst_uid': { "S": dst }
            }
        }

        const client = await this.client();
        const command = new GetItemCommand(params);
        const result = await client.send(command);
        return itemToEntity(result.Item);
    }

    async put(relationship) {
        const timestamp = (new Date()).toISOString();
        const params = {
            TableName: this.tableName,
            Item : {
                'src_uid' : { "S" : relationship.src_uid },
                'dst_uid' : { "S" : relationship.dst_uid },
                'status' : { "S" : relationship.status },
                'timestamp': { "S": timestamp }
            }
        }

        const client = await this.client();
        const command = new PutItemCommand(params);

        await client.send(command);
        return relationship;
    }

    async delete(src_uid, dst_uid) {
        const params = {
            TableName: this.tableName,
            Key: { 
                'src_uid': { "S": src_uid },
                'dst_uid': { "S": dst_uid }
             }
        }

        const client = await this.client();
        const command = new DeleteItemCommand(params);
        await client.send(command);
        return { src_uid: src_uid, dst_uid: dst_uid }
    }
}

const Singleton = new RelationshipDAO();

module.exports = {
    Singleton: Singleton
};