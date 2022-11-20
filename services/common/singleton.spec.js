'use strict';

const expect = require('chai').expect;
const singleton = require('./singleton');

describe( 'Singleton', function() {
	it('is a function', async function() {
		expect(singleton).is.a('function');
	});
});
