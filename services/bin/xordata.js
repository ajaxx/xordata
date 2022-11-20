#!/usr/bin/env node

const cdk = require('aws-cdk-lib');
const { XordataPipelineStack } = require('../lib/xordata-pipeline-stack');

const app = new cdk.App();

new XordataPipelineStack(app, 'XordataPipelineStack', {
  /* Uncomment the next line to specialize this stack for the AWS Account
   * and Region that are implied by the current CLI configuration. */
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION
  },
});
