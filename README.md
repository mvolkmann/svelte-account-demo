# svelte-account-demo

This demonstrates handling account sign up, authentication (login), logout,
and account deletion using Svelte and Node.js (with Express).

## SSL key generation

```bash
cd server

openssl req -x509 \
  -sha256 \
  -nodes \
  -newkey rsa:2048 \
  -days 365 \
  -keyout localhost.key \
  -out localhost.crt
```

For Chrome, browse chrome://flags/#allow-insecure-localhost
and enable "Allow invalid certificates for resources loaded from localhost."

## Steps to run

1. Open a terminal window.
2. `cd server`
3. `npm install`
4. `npm start`
5. Open another terminal window.
6. `cd ui`
7. `npm install`
8. `npm start`
9. Browse localhost:5000
