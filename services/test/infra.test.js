const cdk = require('aws-cdk-lib');
const { Template } = require('aws-cdk-lib/assertions');
const Xordata = require('../lib/xordata-stack');

// example test. To run these tests, uncomment this file along with the
// example resource in lib/infra-stack.js
test('UserPools Created', () => {
   const app = new cdk.App();
   // WHEN
   const stack = new Xordata.XordataStack(app, 'TestStack');
   // THEN
   const template = Template.fromStack(stack);

   template.hasResourceProperties('AWS::SQS::Queue', {
     VisibilityTimeout: 300
   });
});
