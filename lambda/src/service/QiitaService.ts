import * as dayjs from 'dayjs';
import { qiitaApi } from '../api/QiitaApi';
import { qiitaHistoryService } from './QiitaHistoryService';
import { push } from '../lineClient';

async function getItems({ userId }) {
  try {
    const user = await qiitaApi.getUser({ userId });
    const itemCount = user.items_count;
    const pageCount = Math.ceil(itemCount / 100);
    const pageCountList = [...new Array(pageCount)].map((_, i) =>
      String(i + 1),
    );

    let items = [];
    for await (const page of pageCountList) {
      const result = await qiitaApi.getItems({ userId, page });
      if (result) items.push(...result);
    }
    return items;
  } catch (e) {
    return null;
  }
}

async function saveItemInfo({ userId }) {
  const date = dayjs().format('YYYY-MM-DD');
  const result = await this.getItems({ userId });

  // ユーザが存在しない場合
  if (!result) return;

  const items = result.map(item => ({
    id: item.id,
    likeCount: item.likes_count,
  }));
  const total = items.reduce((prev, current) => prev + current.likeCount, 0);

  console.log(JSON.stringify({ items, total }));

  await qiitaHistoryService.put({ userId, date, items, total });
}

async function pushLikeCount({ lineId, qiitaId, startDate, endDate }) {
  try {
    const startDateHistory = await qiitaHistoryService.findByUserIdAndDate({
      userId: qiitaId,
      date: startDate,
    });
    const endDateHistory = await qiitaHistoryService.findByUserIdAndDate({
      userId: qiitaId,
      date: endDate,
    });

    console.log(JSON.stringify({ startDateHistory, endDateHistory }));

    // 当日分がなかったら対象外
    if (!endDateHistory.Item) return null;

    // 登録初日を想定(使い方によってはそれ以外も入ってしまうけど、、)
    if (!startDateHistory.Item && endDateHistory.Item) {
      await push({
        userId: lineId,
        text: `初回登録が完了しました。明日から通知が始まります！`,
      });
      return;
    }

    const count = endDateHistory.Item.total - startDateHistory.Item.total;
    await push({
      userId: lineId,
      text: `${endDate}のいいね数は${count}件でした！`,
    });
    return;
  } catch (e) {
    console.log(e);
    return null;
  }
}

export const qiitaService = {
  getItems,
  saveItemInfo,
  pushLikeCount,
};
