const AWS = require('aws-sdk');
const s3 = new AWS.S3();

exports.handler = async (event) => {
  const fileName = event.queryStringParameters.name;
  const s3Params = {
    Bucket: process.env.BUCKET_NAME,
    Key: `uploaded/${fileName}`,
    Expires: 60, // URL expiration time
  };

  try {
    const signedUrl = await s3.getSignedUrlPromise('putObject', s3Params);
    return {
      statusCode: 200,
      body: JSON.stringify({ url: signedUrl }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Could not create a signed URL" }),
    };
  }
};