const EVENTS = ['keypress', 'mousedown', 'mousemove', 'touchmove'];
//const TIMEOUT_MS = 60 * 1000;
const TIMEOUT_MS = 10 * 1000;

let callback;
let timeoutId;

export function onInactive(cb) {
  callback = cb;
  EVENTS.forEach(event => document.addEventListener(event, resetTimer));
  startTimer();
}

function resetTimer() {
  if (timeoutId) {
    clearTimeout(timeoutId);
    startTimer();
  }
}

function startTimer() {
  timeoutId = setTimeout(() => {
    stopTimer();
    callback();
  }, TIMEOUT_MS);
}

export function stopTimer() {
  clearTimeout(timeoutId);
  timeoutId = undefined;
  EVENTS.forEach(event => document.removeEventListener(event, resetTimer));
}
