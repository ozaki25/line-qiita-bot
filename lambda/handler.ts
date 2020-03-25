import { APIGatewayProxyHandler } from 'aws-lambda';
import 'source-map-support/register';

export const hello: APIGatewayProxyHandler = async event => {
  const body = JSON.parse(event.body);
  console.log({ body });
  return {
    statusCode: 200,
    body: JSON.stringify({ message: body.message }),
  };
};
