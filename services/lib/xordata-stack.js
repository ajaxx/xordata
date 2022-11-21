const path = require('path');
const cdk = require('aws-cdk-lib');
const s3 = require('aws-cdk-lib/aws-s3');
const iam = require('aws-cdk-lib/aws-iam');
const dynamodb = require('aws-cdk-lib/aws-dynamodb');
const lambda = require('aws-cdk-lib/aws-lambda');
const apigw = require('aws-cdk-lib/aws-apigateway');
const cognito = require('aws-cdk-lib/aws-cognito');

const { BlockPublicAccess } = require('aws-cdk-lib/aws-s3');
const { RemovalPolicy } = require('aws-cdk-lib');
const { LambdaIntegration } = require('aws-cdk-lib/aws-apigateway');
const { PolicyStatement } = require('aws-cdk-lib/aws-iam');

class XordataStack extends cdk.Stack {
  /**
   *
   * @param {Construct} scope
   * @param {string} id
   * @param {StackProps=} props
   */
  constructor(scope, id, props) {
    super(scope, id, props);

    // create the user pools (for identity)
    this.createUserPools();

    // key controls
    // this.createKeyIndices();

    // user data
    this.createDataBuckets();
    this.createDataIndices();

    // lambda assets
    this.createLambdaFunctions();

    // API gateway
    this.createApiEndpoints();
  }

  /**
   * Create the lambda functions
   */

  createLambdaFunctions() {
    this.lambdaAsset = lambda.Code.fromAsset(path.join(__dirname, '..', 'users'));

    this.userLambdaFunction = new lambda.Function(this, 'User.Handler', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'user.handler',
      code: this.lambdaAsset,
      role: this.appExecutionRole
    });
  }

  createDataBuckets() {
    this.dataBucket = new s3.Bucket(this, 'UserDataBucket', {
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
      enforceSSL: true,
      removalPolicy: RemovalPolicy.DESTROY
    });
  }

  createDataIndices() {
    this.dataIndex = new dynamodb.Table(this, 'UserDataIndex', {
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      partitionKey: {
        name: 'id',
        type: dynamodb.AttributeType.STRING
      }
    });
  }

  createUserPools() {
    this.userPools = new cognito.UserPool(this, 'UserPool', {
      userPoolName: 'xordata-user-pool',
      selfSignUpEnabled: true,
      signInAlias: {
        email: true
      },
      autoVerify: {
        email: true
      },
      standardAttributes: {
        givenName: {
          required: true,
          mutable: true,
        },
        familyName: {
          required: true,
          mutable: true,
        },
      },
      customAttributes: {
        country: new cognito.StringAttribute({ mutable: true }),
        city: new cognito.StringAttribute({ mutable: true }),
        isAdmin: new cognito.StringAttribute({ mutable: true }),
      },
      passwordPolicy: {
        minLength: 6,
        requireLowercase: true,
        requireDigits: true,
        requireUppercase: false,
        requireSymbols: false,
      },
      accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });
  }

  createApiEndpoints() {
    this.api = new apigw.LambdaRestApi(this, 'XorDataApi', {
      description: 'Endpoints for XorData service APIs',
      handler: this.userLambdaFunction,
      proxy: false
    });

    this.userResource = this.api.root.addResource('users');
    this.userResource.defaultIntegration = new LambdaIntegration(this.userLambdaFunction, { proxy: false });
    this.userResource.addMethod('GET');  // GET /users
    this.userResource.addMethod('POST'); // POST /users
    this.userResource.addMethod('DELETE'); // DELETE /users
  }
}

module.exports = { XordataStack }
