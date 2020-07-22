const MIN_PASSWORD_LENGTH = 8;

let lastId = 0;

export function getHash() {
  const {hash} = location;
  const index = hash.indexOf('?');
  return index === -1 ? hash : hash.substring(0, index);
}

export function getId(prefix = '') {
  lastId++;
  return prefix + lastId;
}

export function getQueryParams() {
  const {hash} = location;
  const index = hash.indexOf('?');
  const queries = hash.substring(index + 1);
  const pairs = queries.split('&');

  const params = {};
  for (const pair of pairs) {
    const [name, value] = pair.split('=');
    params[name] = value;
  }
  return params;
}

export const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

// Returns a message when not valid and an empty string when valid.
export function validatePassword(password) {
  return password.length < MIN_PASSWORD_LENGTH
    ? `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`
    : !/[a-z]/.test(password)
    ? `Password must contain at least one lowercase letter.`
    : !/[A-Z]/.test(password)
    ? `Password must contain at least one uppercase letter.`
    : !/[0-9]/.test(password)
    ? `Password must contain at least one number.`
    : '';
}
