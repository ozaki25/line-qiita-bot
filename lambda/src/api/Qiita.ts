import fetch from 'node-fetch';

const url = 'https://qiita.com/api/v2';

const headers = {
  Authorization: `Bearer ${process.env.QIITA_ACCESS_TOKEN}`,
  'Content-Type': 'application/json',
};

class QiitaApi {
  async getItems({ userId }) {
    const res = await fetch(`${url}/users/${userId}/items`, { headers });
    const json = await res.json();
    console.log(json);
    if (!res.ok) throw new Error(json.message);
    return json;
  }
}

export const qiitaApi = new QiitaApi();
