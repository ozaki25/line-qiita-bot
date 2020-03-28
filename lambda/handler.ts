import { APIGatewayProxyHandler } from 'aws-lambda';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import 'source-map-support/register';
import { reply, push } from './src/lineClient';
import { userService } from './src/service/UserService';
import { qiitaService } from './src/service/QiitaService';
import { uniq } from './src/util/arrayUtil';

type MessageType = {
  events: {
    type: string;
    replyToken: string;
    source: {
      userId: string;
      type: string;
    };
    timestamp: number;
    mode: string;
    message: {
      type: string;
      id: string;
      text: string;
    };
  }[];
  destination: string;
};

export const receive: APIGatewayProxyHandler = async e => {
  const body: MessageType = JSON.parse(e.body);
  if (!body || !body.events || !body.events.length) {
    return { statusCode: 200, body: 'EMPTY' };
  }
  body.events.map(async event => console.log(JSON.stringify(event)));
  const { replyToken, source, message } = body.events[0];
  try {
    // 返信として送信
    const replyResult = await reply({ replyToken, text: message.text });
    console.log({ replyResult });
    // プッシュメッセージとして送信
    const pushResult = await push({
      userId: source.userId,
      text: message.text,
    });
    console.log({ pushResult });
    return { statusCode: 200, body: 'OK' };
  } catch (error) {
    console.log(error.message);
    return { statusCode: 500, body: 'NG' };
  }
};

export const addUser: APIGatewayProxyHandler = async e => {
  try {
    console.log(e.body);
    const body = JSON.parse(e.body);
    const { lineId, qiitaId } = body;
    await userService.put({ lineId, qiitaId });
    return { statusCode: 200, body: 'OK' };
  } catch (error) {
    console.log(error.message);
    return { statusCode: 500, body: 'NG' };
  }
};

export const saveQiitaInfo: APIGatewayProxyHandler = async () => {
  try {
    const result: DocumentClient.ScanOutput = await userService.scan();
    console.log(JSON.stringify(result));

    const qiitaIds = uniq(result.Items.map(({ qiitaId }) => qiitaId));
    console.log({ qiitaIds });

    await Promise.all(
      qiitaIds.map(userId => qiitaService.saveItemInfo({ userId })),
    );

    return { statusCode: 200, body: 'OK' };
  } catch (error) {
    console.log(error.message);
    return { statusCode: 500, body: 'NG' };
  }
};
