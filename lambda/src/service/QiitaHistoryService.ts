import { DynamoDB } from 'aws-sdk';

const tableName = process.env.QIITA_HISTORY_TABLE;

const dynamo = new DynamoDB.DocumentClient();

function findByUserId({ userId }) {
  const params = { TableName: tableName, Key: { userId } };
  return dynamo.query(params).promise();
}

function findByUserIdAndDate({ userId, date }) {
  const params = { TableName: tableName, Key: { userId, date } };
  return dynamo.get(params).promise();
}

function put({ userId, date, items, total }) {
  const params = {
    TableName: tableName,
    Item: { userId, date, items, total },
  };
  return dynamo.put(params).promise();
}

export const qiitaHistoryService = {
  findByUserId,
  findByUserIdAndDate,
  put,
};
