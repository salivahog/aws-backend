import { IProduct, productResponse } from "./utility";

export const handler = async () => {
  const products: IProduct[] = JSON.parse(process.env.PRODUCTS_DATA ?? "[]");
  if (!products.length) {
    return productResponse(404, { message: "No products found" });
  }

  return productResponse(200, products);
};
