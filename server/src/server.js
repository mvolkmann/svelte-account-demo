import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import fs from 'fs';
import https from 'https';
import jwt from 'jsonwebtoken';
import morgan from 'morgan';
import nodemailer from 'nodemailer';
import secrets from '../../secrets.json';
import {v4 as uuidv4} from 'uuid';

const jwtExpirySeconds = 5 * 60;

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

const emailToAccount = {};
const usernameToAccount = {};

const codeToEmail = {};

/**
 * To enable sending email using your OCI GMail account:
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

function sendJson(res, json) {
  // This response header is required when credentials is set to "include".
  res.set('Access-Control-Allow-Origin', 'http://localhost:5000');

  res.set('Access-Control-Expose-Headers', 'Content-Type');
  res.set('Content-Type', 'application/json');
  res.send(json);
}

function validateToken(req, res) {
  const {token} = req.cookies;
  if (!token) {
    res.status(401).end();
    return false;
  }

  let payload;
  try {
    // This parses the JWT string.  It will throw if
    // the token has expired or the signature does not match.
    payload = jwt.verify(token, secrets.jwtKey);
    console.log('server.js validateToken: payload =', payload);
    return true;
  } catch (e) {
    const status = e instanceof jwt.JsonWebTokenError ? 401 : 400;
    res.status(status).end();
    return false;
  }
}

app.get('/account', (req, res) => {
  // Create a JSON string from the usernameToAccount map
  // that does not include passwords.
  const accounts = Object.values(usernameToAccount);
  const json = JSON.stringify(accounts, (key, value) => {
    return key === 'password' ? undefined : value;
  });
  sendJson(res, json);
});

app.delete('/account/:username', (req, res) => {
  const {username} = req.params;
  const found = delete usernameToAccount[username];
  res.status(found ? 204 : 404).end(); // No Content or Not Found
});

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

app.post('/email', (req, res) => {
  if (!validateToken(req, res)) return;

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

app.post('/forgot-password', (req, res) => {
  const {email} = req.body;
  const code = uuidv4();
  codeToEmail[code] = email;
  const url = 'http://localhost:5000/#password?code=' + code;
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

app.post('/login', (req, res) => {
  const {password, username} = req.body;
  const account = usernameToAccount[username];
  if (account && account.password === password) {
    const token = jwt.sign({username}, secrets.jwtKey, {
      algorithm: 'HS256',
      expiresIn: jwtExpirySeconds
    });
    console.log('server.js login: token =', token);

    const copy = {...account};
    delete copy.password;
    res.cookie('token', token, {maxAge: jwtExpirySeconds * 1000});
    sendJson(res, JSON.stringify(copy));
  } else {
    res.status(401).end(); // Unauthorized
  }
});

app.post('/password', (req, res) => {
  const {code, password} = req.body;
  const email = codeToEmail[code];
  if (email) {
    const account = emailToAccount[email];
    if (account) {
      account.password = password;
      delete codeToEmail[code];
      res.end();
    } else {
      res.status(400).send('no account found for email ' + email);
    }
  } else {
    res.status(403).send('code expired');
  }
});

//const port = 1919;
//app.listen(port, () => console.log('listening on port', port));
const HTTPS_PORT = 443;
const httpsOptions = {
  key: fs.readFileSync('server.key'),
  cert: fs.readFileSync('server.cert')
};
https
  .createServer(httpsOptions, app)
  .listen(HTTPS_PORT, () => console.log('listening on port', HTTPS_PORT));
