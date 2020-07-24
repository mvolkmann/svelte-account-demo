<script context="module">
  let answerCb;

  export function alert({dialog, text}) {
    confirm({dialog, text, title: 'Alert', type: 'alert'});
  }

  // title is optional; do not pass type when calling directly
  export function confirm({
    dialog,
    onAnswer,
    text,
    title = 'Question',
    type = 'confirm'
  }) {
    if (!dialog) return;

    answerCb = onAnswer;

    const {classList} = dialog;
    if (type === 'error') {
      classList.add('error-dialog');
    } else {
      classList.remove('error-dialog');
    }

    const titleElement = dialog.querySelector('.title');
    if (titleElement) titleElement.textContent = title;

    const textDiv = dialog.querySelector('.text');
    if (textDiv) {
      // Delete everything currently in the text div.
      while (textDiv.firstChild) {
        textDiv.removeChild(textDiv.lastChild);
      }

      // Add the lines in text to the text div.
      const lines = text.split('\n');
      for (const line of lines) {
        const div = document.createElement('div');
        div.className = 'text';
        div.textContent = line;
        textDiv.appendChild(div);
      }
    }

    const buttons = dialog.querySelector('.buttons');
    buttons.style.display = type === 'confirm' ? 'flex' : 'none';

    if (!dialog.open) dialog.showModal();
  }

  // title is optional
  export function error({dialog, text, title = 'Error'}) {
    confirm({
      dialog,
      isConfirm: false,
      title,
      text,
      type: 'error'
    });
  }

  function respond(dialog, answer) {
    if (answerCb) answerCb(answer);
    dialog.close();
  }
</script>

<script>
  // Render this in top-most component, typically in App.svelte.

  import Dialog from './Dialog.svelte';

  export let dialog;
  export let onClose = undefined;
</script>

<div class="message-dialog">
  <Dialog bind:dialog {onClose} title="Confirm">
    <div>
      <div class="text" />
      <div class="buttons">
        <button on:click={() => respond(dialog, true)}>Yes</button>
        <button on:click={() => respond(dialog, false)}>No</button>
      </div>
    </div>
  </Dialog>
</div>

<style>
  .message-dialog :global(.buttons) {
    display: flex;
    justify-content: center;
  }

  .message-dialog :global(button) {
    margin: 1rem 0.5rem 0 0.5rem;
  }
</style>
