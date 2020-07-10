import * as dayjs from 'dayjs';
import { qiitaApi } from '../api/QiitaApi';
import { qiitaHistoryRepository } from '../repository/QiitaHistoryRepository';

async function getItems(userId: string) {
  const user = await qiitaApi.getUser(userId);
  const itemCount = user.items_count;
  const pageCount = Math.ceil(itemCount / 100);
  const pageCountList = [...new Array(pageCount)].map((_, i) => i + 1);

  // 1ページ100件までしか取れないからページ数分だけAPIを叩いて結果をマージしてる
  let items = [];
  for await (const page of pageCountList) {
    const result = await qiitaApi.getItems(userId, page);
    if (result) items.push(...result);
  }
  return items;
}

async function saveItemInfo(userId: string) {
  const date = dayjs().format('YYYY-MM-DD');
  const result = await getItems(userId);

  // ユーザが存在しない場合
  if (!result) return;

  const items = result.map(item => ({
    id: item.id,
    likeCount: item.likes_count,
  }));
  const total = items.reduce((prev, current) => prev + current.likeCount, 0);

  console.log(JSON.stringify({ items, total }));

  await qiitaHistoryRepository.put(userId, date, items, total);
}

async function getLikeCount(
  qiitaId: string,
  startDate: string,
  endDate: string,
) {
  const {
    Item: startDateHistory,
  } = await qiitaHistoryRepository.findByUserIdAndDate(qiitaId, startDate);
  const {
    Item: endDateHistory,
  } = await qiitaHistoryRepository.findByUserIdAndDate(qiitaId, endDate);
  console.log(JSON.stringify({ startDateHistory, endDateHistory }));

  const start: number | null = startDateHistory ? startDateHistory.total : null;
  const end: number | null = endDateHistory ? endDateHistory.total : null;
  const count = start === null || end === null ? 0 : end - start;
  console.log({ start, end, count });
  return { start, end, count };
}

async function getLikeCounts(
  qiitaId: string,
  startDate: string,
  endDate: string,
) {
  const start = dayjs(startDate);
  const end = dayjs(endDate);
  const days = end.diff(start, 'day');
  const result = await Promise.all(
    [...Array(days)].map(async (_, i) => {
      return await getLikeCount(
        qiitaId,
        start.add(i, 'day').format('YYYY-MM-DD'),
        start.add(i + 1, 'day').format('YYYY-MM-DD'),
      );
    }),
  );
  return result;
}

export const qiitaService = {
  getItems,
  saveItemInfo,
  getLikeCount,
  getLikeCounts,
};
