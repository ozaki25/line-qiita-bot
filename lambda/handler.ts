import { APIGatewayProxyHandler } from 'aws-lambda';
import 'source-map-support/register';
import { reply, push } from './src/lineClient';

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
