import { APIGatewayProxyHandler } from 'aws-lambda';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import dayjs from 'dayjs';
import 'source-map-support/register';
import { pushText, pushImage } from './src/api/LineApi';
import { dispatchGitHubActions } from './src/api/GitHubApi';
import { userRepository } from './src/repository/UserRepository';
import { qiitaHistoryRepository } from './src/repository/QiitaHistoryRepository';
import { qiitaService } from './src/service/QiitaService';
import { captureService } from './src/service/CaptureService';
import { uniq } from './src/util/arrayUtil';

export const addUser: APIGatewayProxyHandler = async e => {
  try {
    console.log(e.body);
    const body = JSON.parse(e.body || '');
    const { lineId, qiitaId } = body;
    await userRepository.put(lineId, qiitaId);
    return returnResponse(200, 'OK');
  } catch (error) {
    console.log(error.message);
    return returnResponse(500, error.message);
  }
};

export const getUser: APIGatewayProxyHandler = async e => {
  try {
    console.log(e.pathParameters);
    const { lineId } = e.pathParameters as { lineId: string };
    const { Item } = await userRepository.findByLineId(lineId);
    console.log(Item);
    return returnResponse(200, Item);
  } catch (error) {
    console.log(error.message);
    return returnResponse(500, error.message);
  }
};

export const getUsers: APIGatewayProxyHandler = async () => {
  try {
    const { Items } = await userRepository.scan();
    console.log(Items);
    return returnResponse(200, Items);
  } catch (error) {
    console.log(error.message);
    return returnResponse(500, error.message);
  }
};

export const getLikeCount: APIGatewayProxyHandler = async e => {
  try {
    console.log(e.queryStringParameters);
    console.log(e.pathParameters);
    const { lineId } = e.pathParameters as { lineId: string };
    // yyyy-mm-dd
    const { start, end } = e.queryStringParameters as {
      start: string;
      end: string;
    };

    const { Item } = await userRepository.findByLineId(lineId);

    if (!Item || Item.qiitaId) return returnResponse(500, 'user not found');

    const { Items } = await qiitaHistoryRepository.findByUserIdAndDateBetween(
      Item.qiitaId,
      start,
      end,
    );
    console.log(Items);
    return returnResponse(200, Items);
  } catch (error) {
    console.log(error.message);
    return returnResponse(500, error.message);
  }
};

export const saveQiitaInfo: APIGatewayProxyHandler = async () => {
  try {
    const users: DocumentClient.ScanOutput = await userRepository.scan();
    console.log(JSON.stringify(users));
    if (!users || !users.Items) throw new Error('no users');

    const qiitaIds = uniq(users.Items.map(({ qiitaId }) => qiitaId));
    console.log({ qiitaIds });

    await Promise.all(
      qiitaIds.map(userId => qiitaService.saveItemInfo(userId)),
    );
    return returnResponse(200, 'OK');
  } catch (error) {
    console.log(error.message);
    return returnResponse(500, error.message);
  }
};

export const pushDailyLikeCount: APIGatewayProxyHandler = async () => {
  try {
    const base = dayjs();
    const startDate = base.subtract(1, 'day').format('YYYY-MM-DD');
    const endDate = base.format('YYYY-MM-DD');
    const users: DocumentClient.ScanOutput = await userRepository.scan();
    console.log(JSON.stringify(users));
    if (!users || !users.Items) throw new Error('no users');

    await Promise.all(
      users.Items.map(async ({ lineId, qiitaId }) => {
        const { count, start, end } = await qiitaService.getLikeCount(
          qiitaId,
          startDate,
          endDate,
        );
        // 当日分のデータがなければ対象外
        if (end === null) return null;

        const date = base.subtract(1, 'day').format('YYYY/MM/DD');
        const text =
          start === null && end !== null
            ? `初回登録が完了しました。明日から通知が始まります！`
            : `${date}のいいね数は${count}件でした！`;
        await pushText(lineId, text);
      }),
    );
    return returnResponse(200, 'OK');
  } catch (error) {
    console.log(error.message);
    return returnResponse(500, error.message);
  }
};

export const pushWeeklyLikeCount: APIGatewayProxyHandler = async () => {
  try {
    const base = dayjs();
    const startDate = base.subtract(7, 'day').format('YYYY-MM-DD');
    const endDate = base.format('YYYY-MM-DD');
    const users: DocumentClient.ScanOutput = await userRepository.scan();
    console.log(JSON.stringify(users));
    if (!users || !users.Items) throw new Error('no users');

    await Promise.all(
      users.Items.map(async ({ lineId, qiitaId }) => {
        const { count, start, end } = await qiitaService.getLikeCount(
          qiitaId,
          startDate,
          endDate,
        );
        // 一週間前か当日のどちらか片方でもデータがなければ対象外
        if (start === null || end === null) return null;
        const userId = lineId;
        const text = `先週のいいね数は${count}件でした！`;

        const contributions = await qiitaService.getLikeCounts(
          qiitaId,
          startDate,
          endDate,
        );
        const url = captureService.getCapturePageUrl(qiitaId, contributions);
        const { Payload } = (await captureService.invoke(url)) as {
          Payload: any;
        };
        console.log({ Payload });
        const { imageUrl, thumbnailUrl } = JSON.parse(String(Payload)).body;

        await pushText(userId, text);
        await pushImage(userId, imageUrl, thumbnailUrl);
      }),
    );
    return returnResponse(200, 'OK');
  } catch (error) {
    console.log(error.message);
    return returnResponse(500, error.message);
  }
};

export const getCapture = async (event: { url: string }) => {
  try {
    console.log(JSON.stringify(event));
    const { url } = event;
    const image = await captureService.excute(url);
    console.log({ image });
    const thumbnail = await captureService.getThumbnail(image);
    console.log({ thumbnail });
    const imageUrl = await captureService.save(image);
    const thumbnailUrl = await captureService.save(thumbnail);
    console.log({ imageUrl, thumbnailUrl });
    return {
      statusCode: 200,
      body: { imageUrl, thumbnailUrl },
    };
  } catch (error) {
    console.log(error.message);
    return returnResponse(500, error.message);
  }
};

export const triggerGitHubActions: APIGatewayProxyHandler = async () => {
  try {
    await dispatchGitHubActions();
    return returnResponse(200, 'OK');
  } catch (error) {
    console.log(error.message);
    return returnResponse(500, error.message);
  }
};

const responseHeders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'Origin, X-Requested-With, Content-Type, Accept',
  'Access-Control-Allow-Methods': '*',
};

const returnResponse = (code: number, message: any) => ({
  statusCode: code,
  headers: responseHeders,
  body: JSON.stringify({ message }),
});
