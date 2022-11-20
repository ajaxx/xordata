const cdk = require('aws-cdk-lib');
const { CodePipeline, CodePipelineSource, ShellStep } = require('aws-cdk-lib/pipelines');
const { XordataPipelineStage } = require('./xordata-pipeline-stage');

class XordataPipelineStack extends cdk.Stack {
  constructor(scope, id, props) {
    super(scope, id, props);

    const repository = CodePipelineSource.connection('ajaxx/xordata', 'main', {
      connectionArn: 'arn:aws:codestar-connections:us-east-2:656366925447:connection/ca0cb95b-c9ec-40cb-9844-3c6a110232a7'
    });

    const pipeline = new CodePipeline(this, 'Pipeline', {
      pipelineName: 'ServicePipeline',
      synth: new ShellStep('Synth', {
        input: repository,
        installCommands: [
          'npm install -g aws-cdk'
        ],
        commands: [
          'cd services',
          'npm ci',
          //'npm run build',
          'pwd',
          'ls lib/',
          'npx cdk synth'
        ],
      }),
    });

    const deploy = new XordataPipelineStage(this, 'Deploy');
    pipeline.addStage(deploy);
  }
}

module.exports = { XordataPipelineStack }
