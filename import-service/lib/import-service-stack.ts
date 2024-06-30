import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';

export class ImportServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

 
    // Define the S3 bucket
    const bucket = new s3.Bucket(this, 'ProductsBucket');

    // Define the Lambda function
    const importProductsFileLambda = new lambda.Function(this, 'ImportProductsFile', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'importProductsFile.handler',
      code: lambda.Code.fromAsset('lambda'),
      environment: {
        BUCKET_NAME: bucket.bucketName,
      },
    });

    // Grant the Lambda function permissions to generate signed URLs
    bucket.grantPut(importProductsFileLambda);

    // Define the API Gateway
    const api = new apigateway.RestApi(this, 'ImportServiceApi', {
      restApiName: 'Import Service',
    });

    // Add the /import resource
    const importResource = api.root.addResource('import');
    importResource.addMethod('GET', new apigateway.LambdaIntegration(importProductsFileLambda), {
      requestParameters: {
        'method.request.querystring.name': true,
      },
    });

    // Output the API endpoint URL
    new cdk.CfnOutput(this, 'ImportServiceApiUrl', {
      value: api.url,
    });
  }
}
