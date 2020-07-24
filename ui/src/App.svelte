<script>
  //import {onInactive, stopTimer} from './activity';
  import {deleteResource, postJson} from './fetch-util';
  import ForgotPassword from './ForgotPassword.svelte';
  import Login from './Login.svelte';
  import NotFound from './NotFound.svelte';
  import Password from './Password.svelte';
  import Profile from './Profile.svelte';
  import secrets from '../../secrets.json';
  import SignUp from './SignUp.svelte';
  import Spinner from './Spinner.svelte';
  import {profile} from './stores';
  import {getHash} from './util';
  import Welcome from './Welcome.svelte';

  const unauthenticatedHashes = ['#forgot', '#login', '#signUp'];

  let authenticated = false;

  const hashMap = {
    '#forgot': ForgotPassword,
    '#login': Login,
    '#password': Password,
    '#profile': Profile,
    '#signUp': SignUp,
    '#welcome': Welcome
  };

  const hash = getHash();
  //if (hash === '#login') stopTimer();
  let component = hashMap[hash] || Login;

  async function deleteAccount() {
    const answer = confirm('Are you sure you want to delete this account?');
    if (answer) {
      try {
        await deleteResource('account/' + $profile.username);
        logout();
      } catch (e) {
        //TODO: Handle better
        console.error('App.svelte deleteAccount: error =', e);
      }
    }
  }

  async function emailTest() {
    try {
      const to = secrets.testEmail;
      await postJson('email', {
        to,
        subject: 'Testing Nodemailer',
        text: 'Did you receive this?',
        username: $profile.username
      });
      alert(`Sent email to ${to}.`);
    } catch (e) {
      console.error('App.svelte emailTest: error =', e);
    }
  }

  function handleSuccess(event) {
    const hash = event.detail || '#welcome';
    if (hash === '#login') {
      logout();
    } else {
      location.href = '/' + hash;
      /*
      onInactive(() => {
        logout();
        // Wait for return to login page.
        setTimeout(() => alert('Your session has timed out.'), 100);
      });
      */
    }
  }

  function hashChange() {
    const {hash} = location;
    component = hashMap[hash];
    authenticated = component && !unauthenticatedHashes.includes(hash);
    if (!component) component = NotFound;
  }

  function logout() {
    postJson('logout', {username: $profile.username});
    location.href = '/#login';
  }
</script>

<svelte:window on:hashchange={hashChange} />

<main>
  <header>
    {#if authenticated}
      <a class="button" on:click={logout}>Logout</a>
      <a class="button" href="/#profile">Profile</a>
      <button on:click={deleteAccount}>Delete Account</button>
      <button on:click={emailTest}>Email Test</button>
    {/if}
  </header>

  <svelte:component
    this={component}
    on:cancel={() => (location.href = '/#login')}
    on:signUp={() => (location.href = '/#signUp')}
    on:success={handleSuccess} />

  <Spinner />
</main>

<style>
  .button,
  button {
    background-color: lightblue;
    border: solid blue 1px;
    border-radius: 0.5rem;
    color: blue;
    padding: 0.5rem;
    text-decoration: none;
  }
</style>
