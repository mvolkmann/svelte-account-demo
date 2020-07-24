<script>
  import {onInactive, stopTimer} from './activity';
  import {deleteResource, postJson} from './fetch-util';
  import ForgotPassword from './ForgotPassword.svelte';
  import Login from './Login.svelte';
  import MessageDialog, {alert} from './MessageDialog.svelte';
  import Password from './Password.svelte';
  import Profile from './Profile.svelte';
  import secrets from '../../secrets.json';
  import SignUp from './SignUp.svelte';
  import Spinner from './Spinner.svelte';
  import {profile} from './stores';
  import {getHash} from './util';
  import Welcome from './Welcome.svelte';

  const unauthenticatedHashes = ['#forgot', '#login', '#signUp'];

  const hashMap = {
    '#forgot': ForgotPassword,
    '#login': Login,
    '#password': Password,
    '#profile': Profile,
    '#signUp': SignUp,
    '#welcome': Welcome
  };

  let hash = getHash();
  $: if (hash === '#login') stopTimer();
  $: component = hashMap[hash] || Login;
  $: authenticated = component && !unauthenticatedHashes.includes(hash);

  let dialog = null;
  let message = '';

  async function deleteAccount() {
    const answer = confirm('Are you sure you want to delete this account?');
    if (answer) {
      try {
        await deleteResource('account/' + $profile.username);
        logout();
      } catch (e) {
        message = e;
      }
    }
  }

  async function emailTest() {
    const {firstName, lastName} = $profile;
    try {
      const to = secrets.testEmail;
      await postJson('email', {
        to,
        subject: 'Testing Nodemailer',
        text: `Hello, ${firstName} ${lastName}!`,
        username: $profile.username
      });
      alert({dialog, text: `Sent email to ${to}.`});
    } catch (e) {
      message = e;
    }
  }

  function handleSuccess(event) {
    const hash = event.detail || '#welcome';
    if (hash === '#login') {
      logout();
    } else {
      location.href = '/' + hash;
      onInactive(dialog, () => {
        console.log('App.svelte handleSuccess: calling logout');
        logout();
        // Wait for return to login page.
        setTimeout(() => alert('Your session has timed out.'), 100);
      });
    }
  }

  function logout() {
    postJson('logout', {username: $profile.username});
    location.href = '/#login';
  }
</script>

<svelte:window on:hashchange={() => (hash = location.hash)} />

<main>
  <header>
    {#if authenticated}
      <a class="button" on:click={logout}>Logout</a>
      <a class="button" href="/#profile">Profile</a>
      <button on:click={deleteAccount}>Delete Account</button>
      <button on:click={emailTest}>Send Email</button>
    {/if}
  </header>

  <svelte:component
    this={component}
    on:cancel={() => (location.href = '/#login')}
    on:signUp={() => (location.href = '/#signUp')}
    on:success={handleSuccess} />

  <div class="error">{message}</div>

  <Spinner />

  <MessageDialog bind:dialog />
</main>
