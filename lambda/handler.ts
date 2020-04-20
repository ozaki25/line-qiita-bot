import { APIGatewayProxyHandler } from 'aws-lambda';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import * as dayjs from 'dayjs';
import 'source-map-support/register';
import { reply, push } from './src/lineClient';
import { userService } from './src/service/UserService';
import { qiitaService } from './src/service/QiitaService';
import { uniq } from './src/util/arrayUtil';

const responseHeders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'Origin, X-Requested-With, Content-Type, Accept',
  'Access-Control-Allow-Methods': '*',
};

export const addUser: APIGatewayProxyHandler = async e => {
  try {
    console.log(e.body);
    const body = JSON.parse(e.body);
    const { lineId, qiitaId } = body;
    await userService.put({ lineId, qiitaId });
    return {
      statusCode: 200,
      headers: responseHeders,
      body: JSON.stringify({ message: 'OK' }),
    };
  } catch (error) {
    console.log(error.message);
    return {
      statusCode: 500,
      headers: responseHeders,
      body: JSON.stringify({ message: error.message }),
    };
  }
};

export const getUser: APIGatewayProxyHandler = async e => {
  try {
    console.log(e.queryStringParameters);
    const { lineId } = e.queryStringParameters;
    const { Item } = await userService.findByLineId({ lineId });
    return {
      statusCode: 200,
      headers: responseHeders,
      body: JSON.stringify(Item),
    };
  } catch (error) {
    console.log(error.message);
    return {
      statusCode: 500,
      headers: responseHeders,
      body: JSON.stringify({ message: error.message }),
    };
  }
};

export const saveQiitaInfo: APIGatewayProxyHandler = async () => {
  try {
    const users: DocumentClient.ScanOutput = await userService.scan();
    console.log(JSON.stringify(users));

    const qiitaIds = uniq(users.Items.map(({ qiitaId }) => qiitaId));
    console.log({ qiitaIds });

    await Promise.all(
      qiitaIds.map(userId => qiitaService.saveItemInfo({ userId })),
    );

    return {
      statusCode: 200,
      headers: responseHeders,
      body: JSON.stringify({ message: 'OK' }),
    };
  } catch (error) {
    console.log(error.message);
    return {
      statusCode: 500,
      headers: responseHeders,
      body: JSON.stringify({ message: error.message }),
    };
  }
};

export const pushDailyLikeCount: APIGatewayProxyHandler = async () => {
  try {
    const startDate = dayjs()
      .subtract(1, 'day')
      .format('YYYY-MM-DD');
    const endDate = dayjs().format('YYYY-MM-DD');
    const users: DocumentClient.ScanOutput = await userService.scan();
    console.log(JSON.stringify(users));

    await Promise.all(
      users.Items.map(({ lineId, qiitaId }) =>
        qiitaService.pushLikeCount({ lineId, qiitaId, startDate, endDate }),
      ),
    );

    return {
      statusCode: 200,
      headers: responseHeders,
      body: JSON.stringify({ message: 'OK' }),
    };
  } catch (error) {
    console.log(error.message);
    return {
      statusCode: 500,
      headers: responseHeders,
      body: JSON.stringify({ message: error.message }),
    };
  }
};
