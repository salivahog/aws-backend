import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as apigateway from "aws-cdk-lib/aws-apigatewayv2";
import * as integrations from "aws-cdk-lib/aws-apigatewayv2-integrations";
import * as iam from "aws-cdk-lib/aws-iam";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";

export class ProjectAwsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const lambdaGetProductsList = new lambda.Function(this, "listProducts", {
      runtime: lambda.Runtime.NODEJS_20_X,
      code: lambda.Code.fromAsset("lambda"),
      handler: "getProductsList.handler",
      environment: {
        PRODUCTS_TABLE_NAME: "products",
        STOCKS_TABLE_NAME: "stocks",
      },
    });

    const createProductFunction = new lambda.Function(this, "createProduct", {
      runtime: lambda.Runtime.NODEJS_20_X,
      code: lambda.Code.fromAsset("lambda"),
      handler: "createProduct.handler",
      environment: {
        PRODUCTS_TABLE_NAME: "products",
        STOCKS_TABLE_NAME: "stocks",
      },
    });

    const LambdaGetProductById = new lambda.Function(this, "getProductById", {
      runtime: lambda.Runtime.NODEJS_20_X,
      code: lambda.Code.fromAsset("lambda"),
      handler: "getProductById.handler",
      environment: {
        PRODUCTS_TABLE_NAME: "products",
        STOCKS_TABLE_NAME: "stocks",
      },
    });

    const policy = new iam.PolicyStatement({
      actions: [
        "dynamodb:Scan",
        "dynamodb:Query",
        "dynamodb:UpdateItem",
        "dynamodb:PutItem",
        "dynamodb:GetItem",
      ],
      resources: [
        "arn:aws:dynamodb:eu-west-1:891377023885:table/products",
        "arn:aws:dynamodb:eu-west-1:891377023885:table/stocks",
      ],
    });

    const api = new apigateway.HttpApi(this, "Api", {
      description: "products rsschool",
      corsPreflight: {
        allowHeaders: ["*"],
        allowOrigins: ["*"],
        allowMethods: [
          apigateway.CorsHttpMethod.GET,
          apigateway.CorsHttpMethod.POST,
          apigateway.CorsHttpMethod.OPTIONS,
        ],
      },
    });

    lambdaGetProductsList.addToRolePolicy(policy);
    createProductFunction.addToRolePolicy(policy);
    LambdaGetProductById.addToRolePolicy(policy);

    api.addRoutes({
      path: "/products",
      methods: [apigateway.HttpMethod.GET],
      integration: new integrations.HttpLambdaIntegration(
        "getListProducts",
        lambdaGetProductsList
      ),
    });

    api.addRoutes({
      path: "/products/{id}",
      methods: [apigateway.HttpMethod.GET],
      integration: new integrations.HttpLambdaIntegration(
        "GetByIdProducts",
        LambdaGetProductById
      ),
    });

    api.addRoutes({
      path: "/products",
      methods: [apigateway.HttpMethod.POST],
      integration: new integrations.HttpLambdaIntegration(
        "createProduct",
        createProductFunction
      ),
    });

    new apigateway.HttpStage(this, "prod", {
      httpApi: api,
      stageName: "prod",
      autoDeploy: true,
    });
  }
}
