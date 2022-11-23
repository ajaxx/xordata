#!/usr/bin/env node

const cdk = require('aws-cdk-lib');
const { XordataPipelineStack } = require('../lib/xordata-pipeline-stack');
const { XordataStack } = require('../lib/xordata-stack');
const { XordataWebAppStack } = require('../lib/xordata-webapp-stack');

const app = new cdk.App();

new XordataStack(app, 'XordataStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION
  }
});

new XordataWebAppStack(app, 'XordataWebAppStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION
  }
});

/*
new XordataPipelineStack(app, 'XordataPipelineStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION
  }
});
*/