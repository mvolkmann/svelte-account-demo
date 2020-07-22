<script>
  // See list of supported icons at
  // https://github.com/FortAwesome/Font-Awesome/blob/master/js-packages/%40fortawesome/fontawesome-common-types/index.d.ts.

  // Example usage, but with lowercase SCRIPT:
  // <s c r i p t>
  //   import * as solid from '@fortawesome/free-solid-svg-icons';
  //   import * as regular from '@fortawesome/free-regular-svg-icons';
  //   import * as brands from '@fortawesome/free-brands-svg-icons';
  //   import Icon from './Icon.svelte';
  // </s c r i p t>
  //
  // <Icon className="icon" icon={solid.faHeart} />
  // <Icon className="icon" icon={regular.faHeart} />
  // <Icon className="icon" icon={brands.faJs} />
  //
  // <s t y l e>
  //   :global(.icon) {
  //     color: green;
  //     font-size: 5rem;
  //   }
  // </s t y l e>
  //
  // Brand icons like faAmazon, faAndroid, faApplePay, faAws,
  // faBluetooth, faCcDiscover, faCcDiscover, faCcMastercard,
  // faCcPaypal, faCcVisa, faChrome, faCss3, faDocker, faDropbox,
  // faEbay, faEdge, faEthereum, faFacebook, faFirefox, faGithub, faGitlab,
  // faGoogle, faHtml5, faInstagram, faJava, faJs, faJsSquare,
  // faLinkedIn, faMarkdown, faMicrosoft, faNode, faNodeJs, faNpm,
  // faPaypal, faPython, faReact, faSafari, faSass, faSpotify, faTwitter,
  // faUbuntu, faVuejs, faYoutube

  import Icon from 'fa-svelte';
  import {afterUpdate} from 'svelte';
  import {getId} from './util';

  export let color;

  // The specified CSS class can specify color and font-size.
  export let className = undefined;

  // This is an icon imported from a @fortawesome package.
  export let icon = undefined;
  export let size;

  const id = getId('icon-');
  const classes = 'icon ' + id + (className ? ' ' + className : '');

  afterUpdate(() => {
    const element = document.querySelector('.' + id);
    if (element) {
      if (color) element.style.color = color;
      if (size) element.style.fontSize = size;
    }
  });
</script>

{#if icon}
  <Icon class={classes} {icon} />
{/if}
