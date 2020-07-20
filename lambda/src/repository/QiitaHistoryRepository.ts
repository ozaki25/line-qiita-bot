import { DynamoDB } from 'aws-sdk';

const tableName = process.env.QIITA_HISTORY_TABLE || '';

const dynamo = new DynamoDB.DocumentClient();

function findByUserId(userId: string) {
  const params = { TableName: tableName, Key: { userId } };
  return dynamo.query(params).promise();
}

function findByUserIdAndDate(userId: string, date: string) {
  const params = { TableName: tableName, Key: { userId, date } };
  return dynamo.get(params).promise();
}

function findByUserIdAndDateBetween(
  userId: string,
  start: string,
  end: string,
) {
  const params = {
    TableName: tableName,
    KeyConditionExpression:
      '#date BETWEEN :startDate and :endDate and userId = :userId',
    ExpressionAttributeNames: {
      '#date': 'date',
    },
    ExpressionAttributeValues: {
      ':startDate': start,
      ':endDate': end,
      ':userId': userId,
    },
  };
  return dynamo.query(params).promise();
}

function put(
  userId: string,
  date: string,
  items: { id: string; likeCount: number }[],
  total: number,
) {
  const params = {
    TableName: tableName,
    Item: { userId, date, items, total },
  };
  return dynamo.put(params).promise();
}

export const qiitaHistoryRepository = {
  findByUserId,
  findByUserIdAndDate,
  findByUserIdAndDateBetween,
  put,
};
