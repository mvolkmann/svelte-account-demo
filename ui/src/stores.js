import {writable} from 'svelte/store';
import secrets from '../../secrets.json';

const defaultProfile = {
  email: secrets.testEmail,
  firstName: secrets.testFirstName,
  lastName: secrets.testLastName,
  password: 'FooBar123',
  username: 'mvolkmann'
};

function persist(key, value) {
  sessionStorage.setItem(key, JSON.stringify(value));
}

export function writableSession(key, initialValue) {
  const sessionValue = JSON.parse(sessionStorage.getItem(key));
  if (!sessionValue) persist(key, initialValue);

  const store = writable(sessionValue || initialValue);
  store.subscribe(value => persist(key, value));
  return store;
}

export const busy = writableSession('busy', false);
export const profile = writableSession('profile', defaultProfile);
