import { Client } from '@line/bot-sdk';

const channelAccessToken: string = process.env.CHANNEL_ACCESS_TOKEN || '';

const lineClient = new Client({ channelAccessToken });

export function reply(text: string, replyToken: string) {
  console.log({ text, replyToken });
  return lineClient.replyMessage(replyToken, [{ type: 'text', text }]);
}

export function pushText(userId: string, text: string) {
  console.log({ userId, text });
  return lineClient.pushMessage(userId, [{ type: 'text', text }]);
}

export function pushImage(
  userId: string,
  imageUrl: string,
  thumbnailUrl: string,
) {
  console.log({ userId, imageUrl, thumbnailUrl });
  return lineClient.pushMessage(userId, [
    {
      type: 'image',
      originalContentUrl: imageUrl,
      previewImageUrl: thumbnailUrl,
    },
  ]);
}
