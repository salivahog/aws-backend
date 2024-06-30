import { productResponse } from "../lambda/utility";
/* import {handler as  getProductsList } from '../lambda/getProductsList'; */
import { handler as getProductById } from "../lambda/getProductById";
import { products } from "../lambda/utility";
import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from "aws-lambda";

describe("test api products", () => {
  beforeEach((): void => {
    process.env.PRODUCTS_DATA = JSON.stringify(products);
  });

  afterEach((): void => {
    delete process.env.PRODUCTS_DATA;
  });

  it("return porduct id", async () => {
    const expected: APIGatewayProxyEvent = {
      pathParameters: {
        id: "1",
      },
    } as any;
    const context: Context = {} as Context;
    const productItem = await getProductById(expected, context, (): void => {});
    expect(productItem).toEqual(productResponse(200, products[0]));
  });

  it("should return error Product not found", async () => {
    const expected: APIGatewayProxyEvent = {
      pathParameters: {
        id: "5",
      },
    } as any;
    const context: Context = {} as Context;
    const productItem = await getProductById(expected, context, (): void => {});
    expect(productItem).toEqual(
      productResponse(404, {
        message: "Product not found",
      })
    );
  });

  it("400 need id", async (): Promise<void> => {
    const event: APIGatewayProxyEvent = {} as APIGatewayProxyEvent;
    const context: Context = {} as Context;
    const result = (await getProductById(
      event,
      context,
      (): void => {}
    )) as APIGatewayProxyResult;

    expect(result.statusCode).toBe(400);
    expect(result.body).toBe(
      JSON.stringify({ message: "Product ID is required" })
    );
  });

  /*  it('list of products', async () => {
    const productList = await getProductsList();
    expect(productList).toEqual(productResponse(200, products));
  });


  it("404 products no found", async (): Promise<void> => {
    process.env.RODUCTS_DATA = "[]";
    const productList = await getProductsList();
    expect(productList).toEqual(productResponse(404, { message: "No products found" }));
  }); */
});
