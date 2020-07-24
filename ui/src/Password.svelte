<script>
  import {createEventDispatcher} from 'svelte';
  import {postJson} from './fetch-util';
  import {getQueryParams, validatePassword} from './util';

  const dispatch = createEventDispatcher();

  const {token} = getQueryParams();

  let confirmPassword = 'FooBar789';
  let message = '';
  let newPassword = 'FooBar789';

  $: canReset = newPassword && confirmPassword === newPassword;

  async function resetPassword() {
    if (confirmPassword !== newPassword) {
      message = 'Passwords do not match.';
      return;
    }

    message = validatePassword(newPassword);
    if (message) return;

    message = validatePassword(confirmPassword);
    if (message) return;

    try {
      await postJson('password', {password: newPassword, token});
      alert('Your password has been changed.');
      dispatch('success', '#login');
    } catch (e) {
      message = e;
    }
  }
</script>

<h1>Password Reset</h1>

<form on:submit|preventDefault={resetPassword}>
  <label>
    New Password
    <input
      type="password"
      autocomplete="new-password"
      bind:value={newPassword} />
  </label>
  <label>
    Confirm Password
    <input
      type="password"
      autocomplete="new-password"
      bind:value={confirmPassword} />
  </label>
  <div class="buttons">
    <button disabled={!canReset}>Reset Password</button>
    <button type="button" on:click={() => dispatch('cancel')}>Cancel</button>
  </div>

  <div class="error">{message}</div>
</form>
