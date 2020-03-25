import { APIGatewayProxyHandler } from 'aws-lambda';
import { Client } from '@line/bot-sdk';
import 'source-map-support/register';

const channelAccessToken = process.env.CHANNEL_ACCESS_TOKEN;

const lineClient = new Client({ channelAccessToken });

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

function reply({ text, replyToken }) {
  return lineClient.replyMessage(replyToken, [{ type: 'text', text }]);
}

export const hello: APIGatewayProxyHandler = async event => {
  const body: MessageType = JSON.parse(event.body);

  try {
    const replies = body.events.map(async event => {
      console.log(JSON.stringify(event));
      return reply({
        replyToken: event.replyToken,
        text: event.message.text,
      });
    });
    const result = await Promise.all(replies);
    console.log({ result });

    return { statusCode: 200, body: 'OK' };
  } catch (error) {
    console.log(error.message);
    return { statusCode: 500, body: 'NG' };
  }
};
