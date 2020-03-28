import * as dayjs from 'dayjs';
import { qiitaApi } from '../api/Qiita';
import { qiitaHistoryService } from './QiitaHistoryService';

async function getItems({ userId }) {
  try {
    const result = await qiitaApi.getItems({ userId });
    return result;
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
  await qiitaHistoryService.put({ userId, date, items, total });
}

export const qiitaService = {
  getItems,
  saveItemInfo,
};
