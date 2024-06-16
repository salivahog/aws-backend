export interface IProduct {
  id: string;
  title: string;
  description: string;
  price: number;
}

export const products: IProduct[] = [
  {
    id: "1",
    title: "Tablet",
    description: "description",
    price: 22,
  },
  {
    id: "2",
    title: "Smartphone",
    description: "description",
    price: 33,
  },
  {
    id: "3",
    title: "Headphones",
    description: "description",
    price: 55,
  },
];

export const productResponse = (statusCode: number, body: any): any => {
  return {
    statusCode,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET",
      "Access-Control-Allow-Headers": "Content-Type",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  };
};
