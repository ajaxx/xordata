"use strict";

const BaseDAO = require('./base_s3');
const dao_validation = require('./validation');
const debug = require('debug')('xordata:dao:document');
const openpgp = require('openpgp');
const aesjs = require('aes-js');
const crypto = require('crypto');

const { EventEmitter } = require('events');
const { GetObjectCommand, PutObjectCommand, ListObjectsV2Command } = require('@aws-sdk/client-s3');
const { resourceLimits } = require('worker_threads');

const Keys = require('./model_keys').Singleton;

const defaultBucketName = 'xordata';

// This module ensures that documents are stored in a logical store.
// For the purpose of this exercise, the store is going to be S3.
// The documents should be FHIR documents that are placed in a specific
// section organized by user.

/* export */ class DocumentDAO extends BaseDAO {
    constructor(configuration) {
        super(configuration, defaultBucketName);
    }

    async validateMessageAuthenticity(document, verificationKeys) {
        // read the detached signature
        const signature = await openpgp.readSignature({
            armoredSignature: document.signature
        });
        const message = await openpgp.createMessage({ text: document.message });
        // verify the signature
        const verificationResult = await openpgp.verify({
            message: message,
            signature: signature,
            verificationKeys: verificationKeys
        });

        const { verified, keyID } = verificationResult.signatures[0];
        try {
            await verified; // throws on invalid signature
            console.log('Signed by key id ' + keyID.toHex());
        } catch (e) {
            throw new Error('Signature could not be verified: ' + e.message);
        }
    }

    async createEncryptionKey() {
        const vector = new Uint8Array(32); // 256-bit key
        crypto.getRandomValues(vector);
        return vector;
    }

    async createInitializationVector() {
        const vector = new Uint8Array(16);
        crypto.getRandomValues(vector);
        return vector;
    }

    async encryptMessage(document, key) {
        // We encrypt the content of the message for local storage
        const iv = await this.createInitializationVector();
        
        // Convert the document message (text) to bytes
        let textBytes = aesjs.utils.utf8.toBytes(document.message);
        if (textBytes.length % 16 != 0) {
            let textBytesPadding = 16 - textBytes.length % 16;
            let textBytesWithPadding = new Uint8Array(textBytes.length + textBytesPadding);
            textBytesWithPadding.set(textBytes);
            textBytes = textBytesWithPadding;
        }

        const aesCbc = new aesjs.ModeOfOperation.cbc(key, iv);
        const encryptedBytes = aesCbc.encrypt(textBytes);
        // Store the binary data, you may convert it to hex
        return aesjs.utils.hex.fromBytes(encryptedBytes);
    }

    async put(document) {
        debug(`storing new document for ${document.uid} in ${document.section}`)

        const docid = crypto.createHash('sha256')
            .update(document.message)
            .digest('hex');

        // read the verificationKeys for this user
        const verificationKeys = await Keys.getVerificationKeys(document.uid);
        // validate the integrity of the message
        await this.validateMessageAuthenticity(document, verificationKeys);
        debug(`message authenticity verified`);

        // Create a random encryption key for this document
        const encryptionKey = await this.createEncryptionKey();
        // encrypt the message
        const encryptedMessage = await this.encryptMessage(document, encryptionKey);

        // encrypt the encryption key
        const encryptionKeyText = aesjs.utils.hex.fromBytes(encryptionKey);
        const encryptionKeyMessage = await openpgp.createMessage({ text: encryptionKeyText });
        const encryptionKeyEncrypted = await openpgp.encrypt({
            message: encryptionKeyMessage,
            encryptionKeys: verificationKeys
        });

        const timestamp = (new Date()).toISOString();
        const dockey = `${document.uid}/${document.section}/${docid}`;
        const docobj = JSON.stringify({
            id: docid,
            timestamp: timestamp,
            message: encryptedMessage,
            kek: encryptionKeyEncrypted,
            signature: document.signature
        });

        const params = {
            Bucket : this.bucketName,
            Key : dockey,
            Body : docobj
        }

        debug(`sending command to s3`);

        const client = await this.client();
        const command = new PutObjectCommand(params);
        await client.send(command);

        return {
            id: docid,
            timestamp: timestamp,
            kek: encryptionKeyEncrypted,
            dockey: dockey
        };
    }

    async get(uid, oid) {
        const dockey = `${uid}/${document.section}/${oid}`;
        let params = {
            Bucket: this.bucketName,
            Prefix: prefix,
            MaxKeys: 100,
            ContinuationToken: continuationToken
        }

        const client = await this.client();
        const command = new GetObjectCommand(params);
        const result = await client.send(command);

    }

    async scan(uid, section, eventEmitter) {
        const client = await this.client();
        
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
            const result = await client.send(command);

            if (result.Contents) {
                result.Contents.forEach(value => {
                    const atoms = value.Key.split('/');
                    const entity = { uid: atoms[0], section: atoms[1], id: atoms[2] };
                    eventEmitter.emit('document', entity);
                });
            }

            isTruncated = result.IsTruncated || false;
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
            emitter.on('end', () => resolve(documents));
            emitter.on('document', (e) => documents.push(e));
            this.scan(uid, section, emitter);
        });
    }
}

const Singleton = new DocumentDAO();

module.exports = {
    DocumentDAO : DocumentDAO,
    Singleton : Singleton,
    findAll : (uid, section) => Singleton.findAll(uid, section)
};