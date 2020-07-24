import {debounce} from 'lodash-es';
import {confirm} from './MessageDialog.svelte';

const EVENTS = ['keypress', 'mousedown', 'mousemove', 'touchmove'];
const WARN_MS = 5 * 1000;
const LOGOUT_MS = 5 * 1000;

let dialog;
let logout;
let timeoutId;

function resetTimer() {
  if (timeoutId) clearTimeout(timeoutId);
  startTimer();
}

const debouncedResetTimer = debounce(resetTimer, 500, {
  leading: true, // resets timer immediately to prevent logout
  trailing: true // resets timer again so it starts from last activity
});

function addListeners() {
  EVENTS.forEach(event =>
    document.addEventListener(event, debouncedResetTimer)
  );
}

export function onInactive(aDialog, callback) {
  dialog = aDialog;
  logout = callback;
  startTimer();
  addListeners();
}

function removeListeners() {
  EVENTS.forEach(event =>
    document.removeEventListener(event, debouncedResetTimer)
  );
}

function startTimer() {
  timeoutId = setTimeout(warn, WARN_MS);
}

export function stopTimer() {
  removeListeners();
  clearTimeout(timeoutId);
  timeoutId = undefined;
}

function warn() {
  removeListeners();

  timeoutId = setTimeout(() => {
    dialog.close();
    logout();
  }, LOGOUT_MS);

  // The timeout is not cleared if the user
  // doesn't respond to the confirmation dialog.
  function onAnswer(answer) {
    if (answer) {
      clearTimeout(timeoutId);
      addListeners();
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
