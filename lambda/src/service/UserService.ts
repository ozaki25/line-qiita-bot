import { DynamoDB } from 'aws-sdk';

const tableName = process.env.USER_TABLE;

const dynamo = new DynamoDB.DocumentClient();

function scan() {
  const params = { TableName: tableName };
  return dynamo.scan(params).promise();
}

function findByLineId({ lineId }) {
  const params = { TableName: tableName, Key: { lineId } };
  return dynamo.get(params).promise();
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
  findByLineId,
  put,
};
