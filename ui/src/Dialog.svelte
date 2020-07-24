<script>
  /**
   * Creates a Dialog that can have a title and any content.
   * The caller should bind to the `dialog` prop.
   * This is used by the caller to open and close the dialog.
   * The dialog is initially closed.
   *
   * To open the dialog as a modal, `.showModal()`.
   * This does not allow interaction with elements outside the dialog.
   *
   * To open the dialog as a non-modal, `dialog.show()`.
   * This allows interaction with elements outside the dialog.
   *
   * To close the dialog, `dialog.close()`.
   *
   * @param {boolean} canClose - boolean that determines whether
   *   a close "X" should appear (defaults to true)
   * @param {string} className - CSS class name to apply to dialog element
   * @param {component} icon - an icon to display before the title
   * @param {function} onClose - a function to call when the dialog is closed
   * @param {string} title - to display in the dialog header
   */

  import dialogPolyfill from 'dialog-polyfill';
  import {onMount} from 'svelte';
  import Icon from './Icon.svelte';

  export let canClose = true;
  export let className = '';
  export let dialog;
  export let icon = undefined;
  export let onClose = undefined;
  export let title = undefined;

  const classes = 'dialog' + (className ? ' ' + className : '');

  onMount(() => {
    if (dialogPolyfill) dialogPolyfill.registerDialog(dialog);
    if (onClose) dialog.addEventListener('close', () => onClose());
  });

  function close() {
    // The close method is not defined in jsdom which is used by Jest.
    // istanbul ignore else
    if (dialog.close) dialog.close();

    // istanbul ignore else
    if (onClose) onClose();
  }
</script>

<dialog bind:this={dialog} class={classes}>
  {#if title}
    <header>
      <Icon color="white" {icon} />
      <div class="title">{title}</div>
      {#if canClose}
        <button class="close-btn" on:click={close} type="button">
          &#x2716;
        </button>
      {/if}
    </header>
  {/if}
  <section class="body">
    <slot />
  </section>
</dialog>

<style>
  .body {
    padding: 0.625rem;
  }

  .close-btn {
    background-color: transparent;
    border: none;
    color: white;
    font-size: 1.5rem;
    margin-left: 1rem;
    outline: none;
    padding: 0;
  }

  .close-btn:hover {
    color: lightgray;
  }

  dialog {
    --space: 1rem;

    /* These properties center the dialog in the browser window. */
    position: absolute;
    top: 50%;
    left: 50%;
    right: 50%;
    transform: translate(-50%, -50%);

    border: none;
    box-shadow: 0 0 10px darkgray;
    min-width: 270px;
    padding: 0;
  }

  .dialog > header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    background-color: cornflowerblue;
    box-sizing: border-box;
    padding: 1rem;
    width: 100%;
  }

  .dialog > header > button {
    margin: 0;
  }

  .dialog > header > .title {
    display: flex;
    align-items: center;
    color: white;
    font-size: 1.5rem;
    font-weight: bold;
    margin-right: 1.25rem;
    padding: 0;
  }

  .error-dialog header {
    background-color: red;
  }

  .error-dialog .title {
    color: white;
  }

  .dialog > section {
    padding: 1rem;
    margin: 0;
  }

  /* This is the style for outside the dialog
   when the dialog is displayed
   to make it clear that it is a "modal dialog" and
   the user cannot interact with anything outside it. */
  :global(::backdrop) {
    background-color: #00000080;
  }
</style>
