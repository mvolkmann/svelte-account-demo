import {taskEnd, taskStart} from './Spinner.svelte';
//import {sleep} from './util';

const URL_PREFIX = 'https://localhost/';

let csrf;

export async function deleteResource(path) {
  const body = JSON.stringify({csrf});
  const headers = {'Content-Type': 'application/json'};
  const res = await fetch(
    URL_PREFIX + path,
    getOptions({method: 'DELETE', headers, body})
  );
  if (!res.ok) {
    const {status, statusText} = res;
    const message =
      status === 404
        ? 'DELETE ' + path + ' service not found'
        : `${statusText} (${status}) ${await res.text()}`;
    throw message;
  }
}

export async function getJson(path) {
  taskStart();
  //await sleep(2000); // simulate long-running task
  try {
    const res = await fetch(URL_PREFIX + path, getOptions());
    if (!res.ok) throw new Error(await res.text());
    return handleJsonResponse(res);
  } finally {
    taskEnd();
  }
}

async function getMessage(res) {
  const message = await res.text();
  return message || `${res.statusText} (${res.status})`;
}

function getOptions(options = {}) {
  options.credentials = 'include';

  if (!options.headers) options.headers = {};
  // Can add common headers here.

  return options;
}

async function handleJsonResponse(res) {
  const contentType = res.headers.get('Content-Type') || '';
  const isJson = contentType.startsWith('application/json');
  if (isJson) {
    const json = await res.json();
    csrf = json.csrf;
    return json;
  }
}

export const postJson = async (path, payload) =>
  postPutJson('POST', path, payload);

export const putJson = async (path, payload) =>
  postPutJson('PUT', path, payload);

async function postPutJson(method, path, payload) {
  taskStart();
  //await sleep(2000); // simulate long-running task
  try {
    payload.csrf = csrf;
    const body = JSON.stringify(payload);
    const res = await fetch(
      URL_PREFIX + path,
      getOptions({
        body,
        headers: {'Content-Type': 'application/json'},
        method
      })
    );
    if (res.ok) return handleJsonResponse(res);

    const {status} = res;
    const message =
      status === 401
        ? 'Invalid username or password'
        : status === 404
        ? method + ' ' + path + ' service not found'
        : await getMessage(res);
    throw message;
  } finally {
    taskEnd();
  }
}
