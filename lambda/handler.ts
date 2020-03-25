import { APIGatewayProxyHandler } from 'aws-lambda';
import 'source-map-support/register';

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
  console.dir({ body });
  const { events, destination } = body;
  console.dir({ events, destination });
  events.map(event => console.dir(event.message));
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: body.events.map(event => event.message.text).join(', '),
    }),
  };
};
