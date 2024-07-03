import {
  APIGatewayProxyEvent,
} from 'aws-lambda';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({ region: 'eu-west-1' });

const BUCKET = process.env.BUCKET_NAME;



const commonHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json",
};

exports.handler = async (event: APIGatewayProxyEvent) => {
  const fileName = event.queryStringParameters?.name;
  if (!fileName) {
    return {
      statusCode: 400,
      headers: commonHeaders,
      body: JSON.stringify({ message: "File name is required" }),
    };
  }

  // Additional fileName validation logic can be added here

  if (!BUCKET) {
    return {
      statusCode: 500,
      headers: commonHeaders,
      body: JSON.stringify({ message: "Server configuration error" }),
    };
  }

  const s3Params = {
    Bucket: BUCKET,
    Key: `uploaded/${fileName}`,
    Expiration: 60, // URL expiration time
  };

  try {
    const putObjectCommand = new PutObjectCommand(s3Params);
    const signedUrl = await getSignedUrl(s3Client, putObjectCommand);
    return {
      statusCode: 200,
      headers: commonHeaders,
      body: JSON.stringify({ url: signedUrl }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: commonHeaders,
      body: JSON.stringify({ message: "Error generating signed URL", error: (error as Error).message }),
    };
  }
};



