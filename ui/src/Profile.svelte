<script>
  import {createEventDispatcher} from 'svelte';
  import {putJson} from './fetch-util';
  import {profile} from './stores';
  import {validatePassword} from './util';

  const dispatch = createEventDispatcher();

  let confirmPassword = 'FooBar123';
  let message = '';

  $: ({email, firstName, lastName, password, username} = $profile);
  $: canUpdate =
    firstName && lastName && email && password && confirmPassword === password;

  function cancel() {
    dispatch('success', '#welcome');
  }

  async function updateProfile() {
    const {password} = $profile;
    if (confirmPassword !== password) {
      message = 'Passwords do not match.';
      return;
    }

    message = validatePassword(password);
    if (message) return;

    try {
      await putJson('account', $profile);
      message = '';
      dispatch('success');
    } catch (e) {
      message = e;
    }
  }
</script>

<form on:submit|preventDefault={updateProfile}>
  <label>
    Username
    <input disabled value={username} />
  </label>
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
    <button disabled={!canUpdate}>Update</button>
    <button type="button" on:click={cancel}>Cancel</button>
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
