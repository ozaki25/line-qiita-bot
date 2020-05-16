import * as dayjs from 'dayjs';
import { qiitaApi } from '../api/QiitaApi';
import { qiitaHistoryService } from './QiitaHistoryService';

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

async function getLikeCount({ qiitaId, startDate, endDate }) {
  try {
    const {
      Item: startDateHistory,
    } = await qiitaHistoryService.findByUserIdAndDate({
      userId: qiitaId,
      date: startDate,
    });
    const {
      Item: endDateHistory,
    } = await qiitaHistoryService.findByUserIdAndDate({
      userId: qiitaId,
      date: endDate,
    });
    console.log(JSON.stringify({ startDateHistory, endDateHistory }));

    const start = startDateHistory ? startDateHistory.total : null;
    const end = endDateHistory ? endDateHistory.total : null;
    const count = Number.isNaN(end - start) ? null : end - start;
    console.log({ start, end, count });
    return { start, end, count };
  } catch (e) {
    console.log(e);
    return null;
  }
}

async function getLikeCounts({ qiitaId, startDate, endDate }) {
  try {
    const start = dayjs(startDate);
    const end = dayjs(endDate);
    const count = end.diff(start, 'day');
    const result = await Promise.all(
      [...Array(count)].map(async (_, i) => {
        const { count } = await getLikeCount({
          qiitaId,
          startDate: start.add(i, 'day').format('YYYY-MM-DD'),
          endDate: start.add(i + 1, 'day').format('YYYY-MM-DD'),
        });
        return count;
      }),
    );
    return result;
  } catch (e) {
    console.log(e);
    return null;
  }
}

export const qiitaService = {
  getItems,
  saveItemInfo,
  getLikeCount,
  getLikeCounts,
};
