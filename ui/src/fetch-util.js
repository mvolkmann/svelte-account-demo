import {taskEnd, taskStart} from './Spinner.svelte';
//import {sleep} from './util';

const URL_PREFIX = 'https://localhost/';

export async function deleteResource(path) {
  const res = await fetch(URL_PREFIX + path, getOptions({method: 'DELETE'}));
  if (!res.ok) {
    const {status, statusText} = res;
    const message =
      status === 404
        ? 'DELETE ' + path + ' service not found'
        : `${statusText} (${status}) ${await res.text()}`;
    throw message;
  }
  sessionEnded(res);
}

export async function getJson(path) {
  taskStart();
  //await sleep(2000); // simulate long-running task
  try {
    const res = await fetch(URL_PREFIX + path, getOptions());
    if (sessionEnded(res)) return {};

    if (!res.ok) throw new Error(await res.text());
    return res.json();
  } finally {
    taskEnd();
  }
}

function getOptions(options = {}) {
  options.credentials = 'include';

  if (!options.headers) options.headers = {};
  // Can add common headers here.

  return options;
}

export const postJson = async (path, payload) =>
  handleJson('POST', path, payload);

export const putJson = async (path, payload) =>
  handleJson('PUT', path, payload);

async function handleJson(method, path, payload) {
  taskStart();
  //await sleep(2000); // simulate long-running task
  try {
    const body = JSON.stringify(payload);
    const res = await fetch(
      URL_PREFIX + path,
      getOptions({
        body,
        headers: {'Content-Type': 'application/json'},
        method
      })
    );
    if (res.ok) {
      const contentType = res.headers.get('Content-Type') || '';
      const isJson = contentType.startsWith('application/json');
      if (sessionEnded(res)) return {};
      return isJson ? res.json() : undefined;
    }

    const {status, statusText} = res;
    const message =
      status === 401
        ? 'Invalid username or password'
        : status === 404
        ? method + ' ' + path + ' service not found'
        : `${statusText} (${status}) ${await res.text()}`;
    throw message;
  } finally {
    taskEnd();
  }
}

function sessionEnded(res) {
  const {redirected, status, url} = res;
  sessionStorage.setItem('lastHttpStatus', String(status));

  const expired = status === 401 || status === 403;
  if (expired) sessionStorage.removeItem('authToken');

  const end = expired || (redirected && url.endsWith('/login'));
  if (end) location.href = '/#login';
  return end;
}
