import { APIGatewayProxyHandler } from 'aws-lambda';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import * as dayjs from 'dayjs';
import 'source-map-support/register';
import { pushText, pushImage } from './src/api/LineApi';
import { userService } from './src/service/UserService';
import { qiitaService } from './src/service/QiitaService';
import { captureService } from './src/service/CaptureService';
import { uniq } from './src/util/arrayUtil';

const responseHeders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'Origin, X-Requested-With, Content-Type, Accept',
  'Access-Control-Allow-Methods': '*',
};

export const addUser: APIGatewayProxyHandler = async e => {
  try {
    console.log(e.body);
    const body = JSON.parse(e.body);
    const { lineId, qiitaId } = body;
    await userService.put({ lineId, qiitaId });
    return {
      statusCode: 200,
      headers: responseHeders,
      body: JSON.stringify({ message: 'OK' }),
    };
  } catch (error) {
    console.log(error.message);
    return {
      statusCode: 500,
      headers: responseHeders,
      body: JSON.stringify({ message: error.message }),
    };
  }
};

export const getUser: APIGatewayProxyHandler = async e => {
  try {
    console.log(e.queryStringParameters);
    const { lineId } = e.queryStringParameters;
    const { Item } = await userService.findByLineId({ lineId });
    return {
      statusCode: 200,
      headers: responseHeders,
      body: JSON.stringify(Item),
    };
  } catch (error) {
    console.log(error.message);
    return {
      statusCode: 500,
      headers: responseHeders,
      body: JSON.stringify({ message: error.message }),
    };
  }
};

export const saveQiitaInfo: APIGatewayProxyHandler = async () => {
  try {
    const users: DocumentClient.ScanOutput = await userService.scan();
    console.log(JSON.stringify(users));

    const qiitaIds = uniq(users.Items.map(({ qiitaId }) => qiitaId));
    console.log({ qiitaIds });

    await Promise.all(
      qiitaIds.map(userId => qiitaService.saveItemInfo({ userId })),
    );

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'OK' }),
    };
  } catch (error) {
    console.log(error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: error.message }),
    };
  }
};

export const pushDailyLikeCount: APIGatewayProxyHandler = async () => {
  try {
    const base = dayjs();
    const startDate = base.subtract(1, 'day').format('YYYY-MM-DD');
    const endDate = base.format('YYYY-MM-DD');
    const users: DocumentClient.ScanOutput = await userService.scan();
    console.log(JSON.stringify(users));

    await Promise.all(
      users.Items.map(async ({ lineId, qiitaId }) => {
        const { count, start, end } = await qiitaService.getLikeCount({
          qiitaId,
          startDate,
          endDate,
        });
        // 当日分のデータがなければ対象外
        if (end === null) return null;

        const userId = lineId;
        const date = base.subtract(1, 'day').format('YYYY/MM/DD');
        const text =
          start === null && end !== null
            ? `初回登録が完了しました。明日から通知が始まります！`
            : `${date}のいいね数は${count}件でした！`;
        await pushText({ userId, text });
      }),
    );

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'OK' }),
    };
  } catch (error) {
    console.log(error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: error.message }),
    };
  }
};

export const pushWeeklyLikeCount: APIGatewayProxyHandler = async () => {
  try {
    const base = dayjs();
    const startDate = base.subtract(7, 'day').format('YYYY-MM-DD');
    const endDate = base.format('YYYY-MM-DD');
    const users: DocumentClient.ScanOutput = await userService.scan();
    console.log(JSON.stringify(users));

    await Promise.all(
      users.Items.map(async ({ lineId, qiitaId }) => {
        const { count, start, end } = await qiitaService.getLikeCount({
          qiitaId,
          startDate,
          endDate,
        });
        // 一週間前か当日のどちらか片方でもデータがなければ対象外
        if (start === null || end === null) return null;
        const userId = lineId;
        const text = `先週のいいね数は${count}件でした！`;

        const contributions = await qiitaService.getLikeCounts({
          qiitaId,
          startDate,
          endDate,
        });
        const url = captureService.getCapturePageUrl(qiitaId, contributions);
        const { Payload } = await captureService.invoke({ url });
        console.log({ Payload });
        const { imageUrl, thumbnailUrl } = JSON.parse(String(Payload)).body;

        await pushText({ userId, text });
        await pushImage({ userId, imageUrl, thumbnailUrl });
      }),
    );

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'OK' }),
    };
  } catch (error) {
    console.log(error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: error.message }),
    };
  }
};

export const getCapture = async (event: { url: string }) => {
  try {
    console.log(JSON.stringify(event));
    const { url } = event;
    const image = await captureService.excute({ url });
    console.log({ image });
    const thumbnail = await captureService.getThumbnail({ image });
    console.log({ thumbnail });
    const imageUrl = await captureService.save({ data: image });
    const thumbnailUrl = await captureService.save({ data: thumbnail });
    console.log({ imageUrl, thumbnailUrl });
    return {
      statusCode: 200,
      body: { imageUrl, thumbnailUrl },
    };
  } catch (error) {
    console.log(error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: error.message }),
    };
  }
};
