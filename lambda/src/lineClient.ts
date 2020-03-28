import { Client, RichMenu } from '@line/bot-sdk';

const channelAccessToken = process.env.CHANNEL_ACCESS_TOKEN;

const lineClient = new Client({ channelAccessToken });

export function reply({ text, replyToken }) {
  return lineClient.replyMessage(replyToken, [{ type: 'text', text }]);
}

export function push({ userId, text }) {
  return lineClient.pushMessage(userId, [{ type: 'text', text }]);
}

export function createRichmenu() {
  const richmenu: RichMenu = {
    size: {
      width: 2500,
      height: 1686,
    },
    selected: false,
    name: 'LINE Developers Info',
    chatBarText: 'Tap to open',
    areas: [
      {
        bounds: {
          x: 34,
          y: 24,
          width: 169,
          height: 193,
        },
        action: {
          type: 'uri',
          uri: 'https://developers.line.biz/en/news/',
        },
      },
      {
        bounds: {
          x: 229,
          y: 24,
          width: 207,
          height: 193,
        },
        action: {
          type: 'uri',
          uri: 'https://www.line-community.me/',
        },
      },
    ],
  };
  return lineClient.createRichMenu(richmenu);
}
