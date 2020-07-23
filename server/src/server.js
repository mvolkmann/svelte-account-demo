import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import fs from 'fs';
import https from 'https';
import jwt from 'jsonwebtoken';
import morgan from 'morgan';
import nodemailer from 'nodemailer';
import secrets from '../../secrets.json';

const JWT_EXPIRY_SECONDS = 5 * 60;
const UNPROTECTED_ROUTES = [
  {method: 'GET', url: '/account'},
  {method: 'POST', url: '/account'},
  {method: 'POST', url: '/login'},
  {method: 'POST', url: '/password'} // uses token in query parameter
];

// These can't just be held in memory if this will be deployed
// to multiple servers that are selected by a load balancer.
const emailToAccount = {};
const tokenToEmail = {};
const usernameToAccount = {};

// For nodemailer ...
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: secrets.emailUser,
    pass: secrets.emailPass
  }
});

const app = express();
app.use(morgan('short')); // logging
app.use(cors({origin: true, credentials: true}));
app.use(cookieParser());
app.use(express.static('public'));
app.use(express.json()); // for JSON body parsing
app.use(express.text()); // for text body parsing

// This custom middleware verifies that requests to protected routes
// include a valid JWT.
app.use((req, res, next) => {
  const {method, url} = req;
  const route = UNPROTECTED_ROUTES.find(
    route => route.method === method && route.url === url
  );
  if (route) return next();

  // Verify the JWT token.

  const {username} = req.body;
  const {token} = req.cookies;
  console.log('server.js middleware: token =', token);
  if (!token) return res.status(401).end();

  try {
    // This parses the JWT string.  It will throw if
    // the token has expired or the signature does not match.
    const payload = jwt.verify(token, secrets.jwtKey);
    const valid = username ? payload.username === username : true;
    if (!valid) throw new Error('invalid token');
    next();
  } catch (e) {
    const status = e instanceof jwt.JsonWebTokenError ? 401 : 400;
    res.status(status).end();
  }
});

/**
 * This sends an email message.
 * To enable sending email using a GMail account:
 * - It must be a GSuite Account, not a regular GMail account.
 * - Click profile icon in upper-right.
 * - Click "Manage your Google Account"
 * - Click "Security" in the left nav.
 * - Scroll to "Less secure app access"
 * - Click "Turn on access"
 * - Toggle "Allow less secure apps" on.
 */
function sendEmail({html, onError, onSuccess, text, to, subject}) {
  const data = {from: secrets.emailUser, to, subject, html, text};
  transporter.sendMail(data, err => {
    if (err) {
      console.error('server.js sendEmail: err =', err);
      onError(JSON.stringify(err));
    } else {
      onSuccess();
    }
  });
}

// This sends a JSON string in the response.
function sendJson(res, json) {
  // This response header is required when credentials is set to "include".
  res.set('Access-Control-Allow-Origin', 'http://localhost:5000');

  res.set('Access-Control-Expose-Headers', 'Content-Type');
  res.set('Content-Type', 'application/json');
  res.send(json);
}

// This returns a list of accounts including everything but passwords.
// It is just for testing.  Remove when finished!
app.get('/account', (req, res) => {
  // Create a JSON string from the usernameToAccount map
  // that does not include passwords.
  const accounts = Object.values(usernameToAccount);
  const json = JSON.stringify(accounts, (key, value) => {
    return key === 'password' ? undefined : value;
  });
  sendJson(res, json);
});

// This deletes an account.
app.delete('/account/:username', (req, res) => {
  const {username} = req.params;
  const {token} = req.cookies;
  const payload = jwt.verify(token, secrets.jwtKey);
  if (payload.username === username) {
    const account = usernameToAccount[username];
    if (account) {
      delete usernameToAccount[username];
      delete emailToAccount[account.email];
    }
    res.status(account ? 204 : 404).end(); // No Content or Not Found
  } else {
    res.status(403).send('cannot delete other users');
  }
});

// This creates a new account.
app.post('/account', (req, res) => {
  const {body} = req;
  const {email, username} = body;
  if (usernameToAccount[username]) {
    res.status(403); // Forbidden
    res.send(`An account with username "${username}" already exists.`);
  } else if (emailToAccount[email]) {
    res.status(403); // Forbidden
    res.send(`An account with email "${email}" already exists.`);
  } else {
    usernameToAccount[username] = body;
    emailToAccount[email] = body;
    res.end();
  }
});

// This updates an account.
app.put('/account', (req, res) => {
  const {body} = req;
  const {email, username} = body;
  if (usernameToAccount[username]) {
    usernameToAccount[username] = body;
    emailToAccount[email] = body;
    res.end();
  } else {
    res.status(404); // Not Found
    res.send(`No account for username "${username}" exists.`);
  }
});

// This sends an email with a specified subject and text.
app.post('/email', (req, res) => {
  const {html, subject, text, to} = req.body;
  sendEmail({
    to,
    subject,
    html,
    text,
    onError(message) {
      res.status(500).send(message);
    },
    onSuccess() {
      res.end();
    }
  });
});

// This sends an email containing a link for resetting
// the password of the associated account.
app.post('/forgot-password', (req, res) => {
  const {email} = req.body;
  const token = jwt.sign({email}, secrets.jwtKey, {
    algorithm: 'HS256',
    expiresIn: JWT_EXPIRY_SECONDS
  });
  tokenToEmail[token] = email;
  const url = 'http://localhost:5000/#password?token=' + token;
  const html =
    '<p>Click the link to reset your password.</p>' +
    `<a href="${url}">Reset Password</a>`;

  sendEmail({
    to: email,
    subject: 'password reset',
    html,
    onError(message) {
      res.status(500).send(message);
    },
    onSuccess() {
      res.end();
    }
  });
});

// This authenticates a login attempt.
// It returns profile data for the user
// and a JWT in a cookie that must be returned in
// all subsequent requests that require authentication.
app.post('/login', (req, res) => {
  const {password, username} = req.body;
  const account = usernameToAccount[username];
  if (account && account.password === password) {
    const token = jwt.sign({username}, secrets.jwtKey, {
      algorithm: 'HS256',
      expiresIn: JWT_EXPIRY_SECONDS
    });

    const copy = {...account};
    delete copy.password;
    res.cookie('token', token, {maxAge: JWT_EXPIRY_SECONDS * 1000});
    sendJson(res, JSON.stringify(copy));
  } else {
    res.status(401).end(); // Unauthorized
  }
});

// This changes the password of the account associated
// with a one-time use token that was provided via an email.
app.post('/password', (req, res) => {
  const {password, token} = req.body;

  try {
    // This parses the JWT string.  It will throw if
    // the token has expired or the signature does not match.
    const payload = jwt.verify(token, secrets.jwtKey);

    const email = tokenToEmail[token];
    if (!email || email !== payload.email) throw new Error('catch me');

    const account = emailToAccount[email];
    if (account) {
      account.password = password;
      delete tokenToEmail[token];
      res.end();
    } else {
      res.status(400).send('no account found for email ' + email);
    }
  } catch (e) {
    res.status(403).send('expired or invalid token');
  }
});

// Start a server that listens for HTTPS requests.
const HTTPS_PORT = 443;
const httpsOptions = {
  key: fs.readFileSync('server.key'),
  cert: fs.readFileSync('server.cert')
};
https
  .createServer(httpsOptions, app)
  .listen(HTTPS_PORT, () => console.log('listening on port', HTTPS_PORT));
