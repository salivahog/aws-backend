import {
  APIGatewayProxyEvent,
  APIGatewayProxyHandler,
  APIGatewayProxyResult,
} from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";
import { productResponse } from "./utility";

const PRODUCTS_TABLE_NAME = process.env.PRODUCTS_TABLE_NAME;
const STOCKS_TABLE_NAME = process.env.STOCKS_TABLE_NAME;
const client = new DynamoDBClient({ region: 'eu-west-1' });
const dynamoDB = DynamoDBDocumentClient.from(client);



export const handler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  console.log('Received event:', event);

  const id = event.pathParameters?.id;
  if (!id) {
    return productResponse(400, { message: "Product ID is required" });
  }

  try {
    const productData = await dynamoDB.send(new GetCommand({
      TableName: PRODUCTS_TABLE_NAME,
      Key: { id }
    }));
    const stockData = await dynamoDB.send(new GetCommand({
      TableName: STOCKS_TABLE_NAME, 
      Key: { product_id: id } 
    }));
    if (!productData.Item) {
      return productResponse(404, { message: "Product not found" });
    }
    const combinedData = {
      ...productData.Item,
      stockCount: stockData.Item ? stockData.Item.count : 0 
    };

    return productResponse(200, combinedData);
  } catch (error) {
    console.error('Error fetching product:', error);
    return productResponse(500, { message: "Internal server error" });
  }
};