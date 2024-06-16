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
    const id = event.pathParameters?.id;
  
    if (!id) {
      return  productResponse(400,{ message: "Product ID is required" });
    }
  
    const product = products.find((data) => data.id === id);
  
    if (!product) {
      return productResponse(404,{ message: "Product not found" });
    }
  
    return productResponse(200,products)
  };