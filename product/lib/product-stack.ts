import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import { products } from "../lambda/utility";

export class ProductStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const getProductsListFunction = new lambda.Function(
      this,
      "GetProductsListHandler",
      {
        runtime: lambda.Runtime.NODEJS_20_X,
        code: lambda.Code.fromAsset("lambda"),
        handler: "getProductsList.handler",
        environment: {
          PRODUCTS_DATA: JSON.stringify(products),
        },
      }
    );

    const getProductByIdFunction = new lambda.Function(
      this,
      "GetProductByIdHandler",
      {
        runtime: lambda.Runtime.NODEJS_20_X,
        code: lambda.Code.fromAsset("lambda"),
        handler: "getProductById.handler",
        environment: {
          PRODUCTS_DATA: JSON.stringify(products),
        },
      }
    );

    const api = new apigateway.RestApi(this, "api", {
      restApiName: "api Products",
      description: "Ttt",
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
      },
    });

    const resourceList = api.root.addResource("products");
    resourceList.addMethod(
      "GET",
      new apigateway.LambdaIntegration(getProductsListFunction)
    );

    const resourceById = resourceList.addResource("{id}");
    resourceById.addMethod(
      "GET",
      new apigateway.LambdaIntegration(getProductByIdFunction)
    );
  }
}
