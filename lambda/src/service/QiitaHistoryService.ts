import { DynamoDB } from 'aws-sdk';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';

const tableName = process.env.QIITA_HISTORY_TABLE;

class QiitaHistoryService {
  private dynamo: DocumentClient;

  constructor() {
    this.dynamo = new DynamoDB.DocumentClient();
  }

  findByUserId({ userId }) {
    const params = { TableName: tableName, Key: { userId } };
    return this.dynamo.query(params).promise();
  }

  findByUserIdAndDate({ userId, date }) {
    const params = { TableName: tableName, Key: { userId, date } };
    return this.dynamo.get(params).promise();
  }

  put({ userId, date, items, total }) {
    const params = {
      TableName: tableName,
      Item: { userId, date, items, total },
    };
    return this.dynamo.put(params).promise();
  }
}

export const userService = new QiitaHistoryService();
