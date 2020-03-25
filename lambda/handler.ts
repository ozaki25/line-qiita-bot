import { APIGatewayProxyHandler } from 'aws-lambda';
import 'source-map-support/register';
import axios from 'axios';

const lineApiURL = 'https://api.line.me/v2/bot/message';

const channelAccessToken = process.env.CHANNEL_ACCESS_TOKEN;

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
  const headers = {
    'content-type': 'application/json',
    Authorization: `Bearer ${channelAccessToken}`,
  };
  return axios.post(
    `${lineApiURL}/reply`,
    { replyToken, messages: [{ type: 'text', text }] },
    { headers },
  );
}

export const hello: APIGatewayProxyHandler = async event => {
  const body: MessageType = JSON.parse(event.body);

  try {
    const result = await Promise.all(
      body.events.map(async event => {
        console.log(JSON.stringify(event));
        return reply({
          replyToken: event.replyToken,
          text: event.message.text,
        });
      }),
    );
    console.log({ result });
    return { statusCode: 200, body: 'OK' };
  } catch (error) {
    console.log(error.message);
    return { statusCode: 500, body: 'NG' };
  }
};
