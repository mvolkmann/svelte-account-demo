<script>
  import {createEventDispatcher} from 'svelte';
  import {postJson} from './fetch-util';
  import {profile} from './stores';

  const dispatch = createEventDispatcher();

  let message = '';

  $: canLogin = $profile.username && $profile.password;

  function signUp() {
    dispatch('signUp');
  }

  async function submit() {
    const {password, username} = $profile;

    try {
      const account = await postJson('login', {password, username});
      $profile.email = account.email;
      $profile.firstName = account.firstName;
      $profile.lastName = account.lastName;
      message = '';
      dispatch('success');
    } catch (e) {
      message = e;
    }
  }
</script>

<form on:submit|preventDefault={submit}>
  <label>
    Username
    <input autocomplete="username" bind:value={$profile.username} />
  </label>
  <label>
    Password
    <input
      type="password"
      autocomplete="current-password"
      bind:value={$profile.password} />
  </label>
  <div class="buttons">
    <button disabled={!canLogin}>Login</button>
    <button type="button" on:click={signUp}>Sign Up</button>
    <button type="button" on:click={() => (location.href = '/#forgot')}>
      Forgot Password
    </button>
  </div>

  <div class="message">{message}</div>
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

  .message {
    color: red;
  }
</style>
