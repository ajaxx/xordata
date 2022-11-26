"use strict";

const BaseDAO = require('./base_s3');
const dao_validation = require('./validation');
const debug = require('debug')('xordata:dao:document');

const { EventEmitter } = require('events');
const { PutObjectCommand, ListObjectsV2Command } = require('@aws-sdk/client-s3');

const defaultBucketName = 'xordata';

// This module ensures that documents are stored in a logical store.
// For the purpose of this exercise, the store is going to be S3.
// The documents should be FHIR documents that are placed in a specific
// section organized by user.

/* export */ class DocumentDAO extends BaseDAO {
    constructor(configuration) {
        super(configuration, defaultBucketName);
    }

    async put(document) {
        debug(`storing new document for ${document.uid} in ${document.section}`)
        debug(`storage length: ${document.content.length}`);

        const s3client = await this.client();
        const documentKey = `${document.uid}/${document.section}/${document.id}`;
        const params = {
            Bucket : this.bucketName,
            Key : documentKey,
            Body : document.content
        }

        debug(`sending command to s3`);
        const command = new PutObjectCommand(params);
        const result = await s3client.send(command);

        // if all has succeeded, we can return success to the caller
        // and the document will now show up in their documents

        debug(`received result from s3`);
    }

    async scan(uid, section, eventEmitter) {
        const s3client = await this.client();
        
        let isTruncated = true;
        let iterations = 0;

        let prefix = uid;
        if (section) {
            prefix += '/' + section;
        }

        while (isTruncated && (iterations < 10)) {
            iterations++;

            let continuationToken = undefined;
            let params = {
                Bucket: this.bucketName,
                Prefix: prefix,
                MaxKeys: 100,
                ContinuationToken: continuationToken
            }

            debug(`sending command to s3`);
            const command = new ListObjectsV2Command(params);
            const result = await s3client.send(command);

            for (let value in result.Contents) {
                let entity = { id: value.Key, uid: uid, section: section };
                eventEmitter.emit('document', entity);
            }

            isTruncated = result.IsTruncated;
            if (isTruncated) {
                continuationToken = result.NextContinuationToken;
            }
        }

        eventEmitter.emit('end');
    }

    async findAll(uid, section) {
        return new Promise((resolve, reject) => {
            let documents = [];
            let emitter = new EventEmitter();
            emitter.on('end', () => resolve(e));
            emitter.on('document', (e) => documents.push(e));
        });
    }
}

const Singleton = new DocumentDAO();

module.exports = {
    DocumentDAO : DocumentDAO,
    Singleton : Singleton,
    findAll : (uid, section) => Singleton.findAll(uid, section)
};