
import { DynamoDB } from 'aws-sdk';
import { randomUUID } from 'crypto';
import AWS = require('aws-sdk');
AWS.config.update({region: 'eu-west-1'});
const dynamoDB = new DynamoDB.DocumentClient();

interface Product {
  title: string;
  description: string;
  price: number;
}

interface ProductItem extends Product {
  id: string;
}

interface StockItem {
  product_id: string;
  count: number;
}

const products: Product[] = [
    {
        title: 'Nike',
        description: 'brand of shoes',
        price: 100,
      },
      {
        title: 'New Balance',
        description: 'brand of shoes',
        price: 200,
      },
      {
        title: 'Adidas',
        description: 'brand of shoes',
        price: 300,
      },
      {
        title: 'Reebok',
        description: 'brand of shoes',
        price: 400,
      },
];

async function putItemsInBatch(tableName: string, items: ProductItem[] | StockItem[]) {
  const params = {
    RequestItems: {
      [tableName]: items.map((item) => ({
        PutRequest: {
          Item: item,
        },
      })),
    },
  };

  try {
    await dynamoDB.batchWrite(params).promise();
    console.log(`Inserted ${items.length} items into ${tableName}`);
  } catch (error) {
    console.error(`Error inserting items into ${tableName}`, error);
  }
}

async function fillTables() {
  const productItems: ProductItem[] = products.map((product) => ({
    id: randomUUID(),
    ...product,
  }));

  const stockItems: StockItem[] = productItems.map(({ id }) => ({
    product_id: id,
    count: 10,
  }));

  await Promise.all([
    putItemsInBatch('products', productItems),
    putItemsInBatch('stocks', stockItems),
  ]);
}

fillTables().catch(console.error);