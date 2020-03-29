import fetch from 'node-fetch';

const url = 'https://qiita.com/api/v2';

const headers = {
  Authorization: `Bearer ${process.env.QIITA_ACCESS_TOKEN}`,
  'Content-Type': 'application/json',
};

async function getItems({ userId }) {
  const res = await fetch(`${url}/users/${userId}/items?per_page=100`, {
    headers,
  });
  const json = await res.json();
  // console.log(json);
  if (!res.ok) throw new Error(json.message);
  return json;
}

export const qiitaApi = {
  getItems,
};
