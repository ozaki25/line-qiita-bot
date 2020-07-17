const url = process.env.REACT_APP_API_URL;

const headers = {
  'Content-Type': 'application/json',
};

export type GetUserProps = {
  lineId: string;
};

export type PostUserProps = {
  lineId: string;
  qiitaId: string;
};

async function getUser({ lineId }: GetUserProps) {
  const res = await fetch(`${url}/users?lineId=${lineId}`, { headers });
  const json = await res.json();
  console.log(json);
  if (!res.ok) throw new Error(json.message);
  return json;
}

async function postUser({ lineId, qiitaId }: PostUserProps) {
  const body = JSON.stringify({ lineId, qiitaId });
  const res = await fetch(`${url}/users`, { method: 'POST', body, headers });
  const json = await res.json();
  console.log(json);
  if (!res.ok) throw new Error(json.message);
  return json;
}

export const userApi = {
  getUser,
  postUser,
};
