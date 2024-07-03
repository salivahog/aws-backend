import {
  APIGatewayProxyEvent,
  APIGatewayProxyHandler,
  APIGatewayProxyResult,
} from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand, BatchGetCommand, GetCommand } from "@aws-sdk/lib-dynamodb";

import { productResponse } from "./utility";

const client = new DynamoDBClient({ region: 'eu-west-1' });
const dynamoDB = DynamoDBDocumentClient.from(client);

const PRODUCTS_TABLE_NAME = process.env.PRODUCTS_TABLE_NAME;
const STOCKS_TABLE_NAME = process.env.STOCKS_TABLE_NAME;

export const handler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  console.log(event);

  
  try {
      const productsData = await dynamoDB.send(new ScanCommand({ TableName: PRODUCTS_TABLE_NAME }));
      const products = productsData.Items 

      if (!products || !products.length) {
          return productResponse(404, { message: "Products not found" });
      }

      for (const product of products) {

          const stockData = await dynamoDB.send(new GetCommand({
              TableName: STOCKS_TABLE_NAME,
              Key: { product_id: product.id }
          }));

          product.count = stockData.Item ? stockData.Item.count : 0;
      }

      return productResponse(200, products);

  } catch (error) {
      return productResponse(500, error);
  }
};