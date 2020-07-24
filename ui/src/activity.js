import {debounce} from 'lodash-es';
import {confirm} from './MessageDialog.svelte';

const EVENTS = ['keypress', 'mousedown', 'mousemove', 'touchmove'];
const WARN_MS = 5 * 1000;
const LOGOUT_MS = 5 * 1000;

let dialog;
let logout;
let timeoutId;

function resetTimer() {
  if (timeoutId) {
    clearTimeout(timeoutId);
    console.log('activity.js resetTimer: cleared', timeoutId);
  }
  startTimer();
}

const debouncedResetTimer = debounce(resetTimer, 500, {
  leading: true,
  trailing: true
});

export function onInactive(aDialog, callback) {
  dialog = aDialog;
  logout = callback;
  startTimer();
  EVENTS.forEach(event =>
    document.addEventListener(event, debouncedResetTimer)
  );
}

function removeListeners() {
  EVENTS.forEach(event =>
    document.removeEventListener(event, debouncedResetTimer)
  );
}

function startTimer() {
  timeoutId = setTimeout(warn, WARN_MS);
  console.log('activity.js startTimer: started', timeoutId);
}

export function stopTimer() {
  removeListeners();
  clearTimeout(timeoutId);
  console.log('activity.js stopTimer: cleared', timeoutId);
  timeoutId = undefined;
}

function warn() {
  timeoutId = setTimeout(() => {
    removeListeners();
    console.log('activity.js warn: calling logout');
    logout();
  }, LOGOUT_MS);
  console.log('activity.js warn: started', timeoutId);

  // The timeout is not cleared if the user
  // doesn't respond to the confirmation dialog.
  function onAnswer(answer) {
    if (answer) {
      clearTimeout(timeoutId);
      startTimer();
    } else {
      clearTimeout(timeoutId);
      logout();
    }
  }

  const title = 'Continue Session?';
  const text =
    'You be logged out in one minute due to inactivity.\n' +
    'Press Yes to remain logged in.\n' +
    'Press No to log out now.';
  confirm({dialog, onAnswer, title, text});
}
