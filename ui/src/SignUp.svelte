<script>
  import {createEventDispatcher} from 'svelte';
  import {postJson} from './fetch-util';
  import {profile} from './stores';
  import {validatePassword} from './util';

  const dispatch = createEventDispatcher();

  let confirmPassword = 'FooBar123';
  let message = '';

  const {email, firstName, lastName, password, username} = $profile;
  $: canSignUp =
    firstName &&
    lastName &&
    email &&
    username &&
    password &&
    confirmPassword === password;

  async function signUp() {
    const {password} = $profile;
    if (confirmPassword !== password) {
      message = 'Passwords do not match.';
      return;
    }

    message = validatePassword(password);
    if (message) return;

    try {
      await postJson('account', $profile);
      message = '';
      dispatch('success');
    } catch (e) {
      message = e;
    }
  }
</script>

<form on:submit|preventDefault={signUp}>
  <label>
    First Name
    <input autocomplete="given-name" bind:value={$profile.firstName} />
  </label>
  <label>
    Last Name
    <input autocomplete="family-name" bind:value={$profile.lastName} />
  </label>
  <label>
    Email
    <input type="email" autocomplete="email" bind:value={$profile.email} />
  </label>
  <label>
    Username
    <input autocomplete="username" bind:value={$profile.username} />
  </label>
  <label>
    Password
    <input
      type="password"
      autocomplete="new-password"
      bind:value={$profile.password} />
  </label>
  <label>
    Confirm Password
    <input
      type="password"
      autocomplete="new-password"
      bind:value={confirmPassword} />
  </label>
  <div class="buttons">
    <button disabled={!canSignUp}>Sign Up</button>
    <button type="button" on:click={() => dispatch('cancel')}>Cancel</button>
  </div>

  <div class="error">{message}</div>
</form>

<style>
  .buttons {
    text-align: center;
  }

  form {
    display: inline-block;
  }

  label {
    text-align: right;
  }
</style>
