import { DynamoDB } from 'aws-sdk';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';

const tableName = process.env.USER_TABLE;

class UserService {
  private dynamo: DocumentClient;

  constructor() {
    this.dynamo = new DynamoDB.DocumentClient();
  }

  put({ lineId, qiitaId }) {
    const params = {
      TableName: tableName,
      Item: { lineId, qiitaId },
    };
    return this.dynamo.put(params).promise();
  }
}

export const userService = new UserService();
