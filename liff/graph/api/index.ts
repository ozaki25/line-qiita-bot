import fetch from 'node-fetch';

const url = process.env.REACT_APP_API_URL;

const headers = {
  'Content-Type': 'application/json',
};

type GetUserResponse = Promise<{ lineId: string; qiitaId: string }[]>;

async function getUsers(): GetUserResponse {
  const res = await fetch(`${url}/users`, { headers });
  const json = await res.json();
  console.log(json);
  if (!res.ok) throw new Error(json.message);
  return json;
}

type GetLikeCountResponse = Promise<{ total: number }[]>;

async function getLikeCount(
  lineId: string,
  start: string,
  end: string,
): GetLikeCountResponse {
  const res = await fetch(
    `${url}/users/${lineId}/likes?start=${start}&end=${end}`,
    { headers },
  );
  const json = await res.json();
  console.log(json);
  if (!res.ok) throw new Error(json.message);
  return json;
}

export const userApi = {
  getUsers,
  getLikeCount,
};
