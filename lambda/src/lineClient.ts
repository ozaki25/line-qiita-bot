import { Client } from '@line/bot-sdk';

const channelAccessToken = process.env.CHANNEL_ACCESS_TOKEN;

const lineClient = channelAccessToken
  ? new Client({ channelAccessToken })
  : null;

export function reply({ text, replyToken }) {
  console.log({ text, replyToken });
  return lineClient.replyMessage(replyToken, [{ type: 'text', text }]);
}

export function push({ userId, text }) {
  console.log({ userId, text });
  return lineClient.pushMessage(userId, [{ type: 'text', text }]);
}
