'use strict';

const uuid = require('uuid');
const expect = require('chai').expect;
const lambdaTester = require('lambda-tester');
const lambdaEventMock = require('lambda-event-mock');

const myLambda = require('./index');
