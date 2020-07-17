import fetch from 'node-fetch';

const url = process.env.GITHUB_ACTIONS_URL || '';
const token = process.env.GITHUB_TOKEN || '';

async function dispatchGitHubActions() {
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `token ${token}`,
      accept: 'application/vnd.github.v3+json',
    },
    body: JSON.stringify({ event_type: 'deploy' }),
  });
  console.log(JSON.stringify(res));
  if (!res.ok) throw new Error(JSON.stringify(res));
  return;
}

export { dispatchGitHubActions };
