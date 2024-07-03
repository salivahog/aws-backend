

import {
  S3Client,
  GetObjectCommand,
  CopyObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
const s3Client = new S3Client({ region: 'eu-west-1' });
import csv from 'csv-parser';
import { Readable } from 'stream';
const BUCKET = process.env.BUCKET_NAME;

exports.handler = async (event: any) => {
  const bucket = BUCKET;
  const objKey = event.Records[0].s3.object.key;

  if (!objKey.startsWith('uploaded/')) {
    return;
  }

  try {
    await processCsv(bucket, objKey);
    await moveObject(bucket, objKey, 'uploaded/', 'parsed/');
    console.log('File processed and moved to parsed');
  } catch (error) {
    console.error('Error processing file:', error);
    throw error; // Rethrow after logging for AWS Lambda to catch
  }
};

async function processCsv(bucket: string | undefined, objKey: string) {
  const params = { Bucket: bucket ?? '', Key: objKey };
  const getObjectCommand = new GetObjectCommand(params);
  const { Body } = await s3Client.send(getObjectCommand);

  if (!Body || !(Body instanceof Readable)) {
    throw new Error('Invalid or empty body');
  }

  const arr = [];
  await new Promise((resolve, reject) => {
    Body.pipe(csv())
      .on('data', (data: any) => {
        console.log(data);
        arr.push(data)})
      .on('end', resolve)
      .on('error', reject);
  });
}

async function moveObject(bucket: string = '', objKey: string, fromPrefix: string, toPrefix: string) {
  const newKey = objKey.replace(fromPrefix, toPrefix);
  const copyParams = { Bucket: bucket, CopySource: `${bucket}/${objKey}`, Key: newKey };
  await s3Client.send(new CopyObjectCommand(copyParams));

  const deleteParams = { Bucket: bucket, Key: objKey };
  await s3Client.send(new DeleteObjectCommand(deleteParams));
}