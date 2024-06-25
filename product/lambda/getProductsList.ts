import {
  APIGatewayProxyEvent,
  APIGatewayProxyHandler,
  APIGatewayProxyResult,
} from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand, BatchGetCommand } from "@aws-sdk/lib-dynamodb";

import { productResponse } from "./utility";

const client = new DynamoDBClient({ region: 'eu-central-1' });
const dynamoDB = DynamoDBDocumentClient.from(client);

const PRODUCTS_TABLE_NAME = process.env.PRODUCTS_TABLE_NAME;
const STOCKS_TABLE_NAME = process.env.STOCKS_TABLE_NAME;

if (!PRODUCTS_TABLE_NAME || !STOCKS_TABLE_NAME) {
  throw new Error("Environment variables for table names are not set");
}

export const handler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  console.log(event);

  try {
    const productsData = await dynamoDB.send(new ScanCommand({ TableName: PRODUCTS_TABLE_NAME }));
    const products= productsData.Items ;

    if (!products || !products.length) {
      return productResponse(404, { message: "No products found" });
    }

    const keys = products.map(product => ({ product_id: product.id }));
    const stocksData = await dynamoDB.send(new BatchGetCommand({
      RequestItems: {
        [STOCKS_TABLE_NAME]: {
          Keys: keys,
        },
      },
    }));


    const enrichedProducts = products.map(product => {
      const stock = stocksData.Responses?.[STOCKS_TABLE_NAME]?.find(s => s.product_id === product.id);
      return { ...product, stock: stock ? stock.count : 0 };
    });

    return productResponse(200, enrichedProducts);
  } catch (error) {
    console.error(error);
    return productResponse(500, { message: "Internal server error" });
  
  }
};