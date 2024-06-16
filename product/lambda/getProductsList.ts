import {
    APIGatewayProxyEvent,
    APIGatewayProxyHandler,
    APIGatewayProxyResult,
  } from "aws-lambda";
  import { IProduct, productResponse } from "./utility";
  
  export const handler: APIGatewayProxyHandler = async (
    event: APIGatewayProxyEvent,
  ): Promise<APIGatewayProxyResult> => {
    const products: IProduct[] = JSON.parse(process.env.MOCK_PRODUCTS ?? "[]");
    if (!products.length) {
      return productResponse(404,{ message: "No products found" });
     
    }
  
    return productResponse(200,products)
  };