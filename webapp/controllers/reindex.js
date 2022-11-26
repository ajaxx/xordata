const crypto = require('crypto');
const EventEmitter = require('events');
const debug = require('debug')('xordata:controller:documents');
// DAO for documents
const DocumentModel = require('../models/document_model').Singleton;
// DAO for document indices
const DocumentIndexDAO = require('../models/document_index_model')

module.exports = function(uid, options) {
    return new Promise((resolve, reject) => {
        const emitter = new EventEmitter();
        emitter.on('end', () => resolve());
        emitter.on('document', (document) => {
            console.log('document');            
        });

        // scan the dao
        DocumentModel.scan(uid, options.section, emitter);
    });
};
