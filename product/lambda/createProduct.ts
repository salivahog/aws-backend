import {
    APIGatewayProxyEvent,
    APIGatewayProxyHandler,
    APIGatewayProxyResult,
  } from 'aws-lambda';
  import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
  import {
    DynamoDBDocumentClient,
    TransactWriteCommand,
  } from '@aws-sdk/lib-dynamodb';
  
  import { randomUUID } from 'crypto';
import { productResponse } from './utility';
  
  const client = new DynamoDBClient({ region: 'eu-west-1' });
  const dynamoDB = DynamoDBDocumentClient.from(client);
  
  const PRODUCTS_TABLE_NAME = process.env.PRODUCTS_TABLE_NAME;
  const STOCKS_TABLE_NAME = process.env.STOCKS_TABLE_NAME;
  
  export const handler: APIGatewayProxyHandler = async (
    event: APIGatewayProxyEvent
  ): Promise<APIGatewayProxyResult> => {
     console.log(event);
      try {
          const { title, description, price, count } = JSON.parse(event.body || '{}');
  
          if (!title || !description || !price || !count) {
            return productResponse(400,{message:'Need parrams: title, description, price, count'})
          }
  
          const id = randomUUID();
          const productItem = {
            TableName: PRODUCTS_TABLE_NAME,
            Item: {
              id:id,
              title,
              description,
              price,
            },
          };
          
          const stockItem = {
            TableName: STOCKS_TABLE_NAME,
            Item: {
              product_id: id,
              count,
            },
          };
          const transactItems = [
            { Put: productItem },
            { Put: stockItem },
          ];



        await dynamoDB.send(new TransactWriteCommand({ TransactItems: transactItems }));
  
  
          return productResponse(201,{ message: 'Product created successfully', product: productItem.Item })
  
      } catch (error) {
  
          return productResponse(500,error)
      }
  };