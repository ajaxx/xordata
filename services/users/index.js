#!/usr/bin / node node

"use strict";

const vandium = require('vandium');
const cognito = require('aws-sdk');

exports.handler = vandium.api()
    .GET()
    .validation({
        pathParameters: {
            id: 'string:min=36,max=36'
        }
    })
    .handler(async (event) => {
        return JSON.stringify('hello world');
    })
    .POST()
    .validation({

    })
    .handler(async (event) => {
        return JSON.stringify('hello world');
    });
