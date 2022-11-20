const { Stage } = require("aws-cdk-lib");
const { Construct } = require("constructs");
const { XordataStack } = require("./xordata-stack");

class XordataPipelineStage extends Stage {
  constructor(scope, id, props) {
    super(scope, id, props);
    this.service = new XordataStack(this, 'Xordata');
    this.urlOutput = this.service.urlOutput;
  }
}

module.exports = { XordataPipelineStage }
