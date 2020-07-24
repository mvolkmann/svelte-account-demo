import {debounce} from 'lodash-es';

const EVENTS = ['keypress', 'mousedown', 'mousemove', 'touchmove'];
//const TIMEOUT_MS = 60 * 1000; // one minute
const TIMEOUT_MS = 5 * 1000; // five seconds

let callback;
let timeoutId;

function resetTimer() {
  if (timeoutId) {
    console.log('activity.js resetTimer: clearing', timeoutId);
    clearTimeout(timeoutId);
    startTimer();
  }
}

const debouncedResetTimer = debounce(resetTimer, 500, {
  leading: true,
  trailing: true
});

export function onInactive(cb) {
  callback = cb;
  EVENTS.forEach(event =>
    document.addEventListener(event, debouncedResetTimer)
  );
  startTimer();
}

function startTimer() {
  timeoutId = setTimeout(() => {
    console.log('activity.js startTimer: got timeout');
    stopTimer();
    callback();
  }, TIMEOUT_MS);
  console.log('activity.js startTimer: timeoutId =', timeoutId);
}

export function stopTimer() {
  console.log('activity.js stopTimer: clearing', timeoutId);
  clearTimeout(timeoutId);
  timeoutId = undefined;
  EVENTS.forEach(event =>
    document.removeEventListener(event, debouncedResetTimer)
  );
}
