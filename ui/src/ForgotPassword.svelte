<script>
  import {createEventDispatcher} from 'svelte';
  import {postJson} from './fetch-util';
  import secrets from '../../secrets.json';

  const dispatch = createEventDispatcher();

  let email = secrets.testEmail;
  let message = '';

  async function sendEmail() {
    try {
      await postJson('forgot-password', {email});
      dispatch('success', '#login');
      alert('Check your email for a link to reset your password.');
    } catch (e) {
      message = e;
    }
  }
</script>

<p>
  Enter your email address and press "Send Email" to receive an email that
  includes a link you can click to reset your password.
</p>
<form on:submit|preventDefault={sendEmail}>
  <label>
    Email
    <input type="email" autocomplete="email" bind:value={email} size="30" />
  </label>
  <button>Send Email</button>
  <button type="button" on:click={() => dispatch('cancel')}>Cancel</button>
</form>

<div class="message">{message}</div>

<style>
  .message {
    color: red;
  }
</style>
