'use strict';

const expect = require('chai').expect;
const index = require('./index');

describe( 'Configuration', function() {
	it('has dynamodb configuration', async function() {
		let db = index.db;
		expect(db.dynamodb).to.exist;
	});
	it('can create dynamodb client', async function() {
		let dynamo = index.db.dynamodb;
		expect(dynamo).to.exist;
		expect(dynamo.getClient).to.exist;
		let client = await dynamo.getClient();
		expect(client).to.exist;
	});
});
