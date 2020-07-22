import {writable} from 'svelte/store';
import secrets from '../../secrets.json';

const defaultProfile = {
  email: secrets.testEmail,
  firstName: secrets.testFirstName,
  lastName: secrets.testLastName,
  password: 'FooBar123',
  username: 'mvolkmann'
};

export const busy = writable(false);
export const profile = writable(defaultProfile);
