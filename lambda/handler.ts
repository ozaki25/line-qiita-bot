import { APIGatewayProxyHandler } from 'aws-lambda';
import 'source-map-support/register';
import { reply, push, createRichmenu } from './src/lineClient';

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

export const hello: APIGatewayProxyHandler = async event => {
  const body: MessageType = JSON.parse(event.body);

  body.events.map(async event => console.log(JSON.stringify(event)));

  try {
    const replies = body.events.map(async ({ replyToken, message }) => {
      return reply({ replyToken, text: message.text });
    });
    const pushes = body.events.map(async ({ source, message }) => {
      return push({ userId: source.userId, text: message.text });
    });
    const result = await Promise.all([...replies, ...pushes]);
    console.log({ result });

    return { statusCode: 200, body: 'OK' };
  } catch (error) {
    console.log(error.message);
    return { statusCode: 500, body: 'NG' };
  }
};

export const richmenu: APIGatewayProxyHandler = async event => {
  try {
    const result = await createRichmenu();
    console.log({ result });
    return { statusCode: 200, body: 'OK' };
  } catch (error) {
    console.dir({ error });
    return { statusCode: 500, body: 'NG' };
  }
};
