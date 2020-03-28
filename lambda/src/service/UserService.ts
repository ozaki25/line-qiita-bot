import { DynamoDB } from 'aws-sdk';

const tableName = process.env.USER_TABLE;

const dynamo = new DynamoDB.DocumentClient();

function scan() {
  const params = { TableName: tableName };
  return dynamo.scan(params).promise();
}

function put({ lineId, qiitaId }) {
  const params = {
    TableName: tableName,
    Item: { lineId, qiitaId },
  };
  return dynamo.put(params).promise();
}

export const userService = {
  scan,
  put,
};
