const { randomBytes } = require('node:crypto');
const {
  ISSUER_BASE_URL,
  API_URL,
  CLIENT_ID,
  CLIENT_SECRET,
  PORT = 37500,
} = process.env;

// A fresh local key keeps the teaching app usable without sharing a cookie key.
// Set SESSION_SECRET in .env if sessions should survive an app restart.
const suppliedSecret = process.env.SESSION_SECRET;
const SESSION_SECRET =
  suppliedSecret &&
  suppliedSecret !== 'a long, randomly-generated string stored in env'
    ? suppliedSecret
    : randomBytes(32).toString('hex');

function checkEnvironment() {
  if (process.env.CODESPACE_NAME) {
    const domain = process.env.GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN;
    if (!domain)
      throw new Error(
        'Codespaces forwarding domain is missing. Reopen the development container.'
      );
    return `https://${process.env.CODESPACE_NAME}-${PORT}.${domain}`;
  }
  return `http://localhost:${PORT}`;
}

const appUrl = checkEnvironment();
const expectedHost = new URL(appUrl).host;

function checkUrl() {
  return (req, res, next) => {
    if (req.headers.host !== expectedHost) {
      // Keep callback/query data and use the configured origin, never a request header.
      const path = req.originalUrl || '/';
      return res.redirect(302, appUrl + (path.startsWith('/') ? path : '/'));
    }
    return next();
  };
}

function removeTrailingSlashFromUrl(url) {
  return url ? url.replace(/\/$/, '') : url;
}

console.log(`WEB APP configured for ${appUrl}`);

module.exports = {
  checkUrl,
  APP_URL: appUrl,
  API_URL: removeTrailingSlashFromUrl(API_URL),
  ISSUER_BASE_URL: removeTrailingSlashFromUrl(ISSUER_BASE_URL),
  CLIENT_ID,
  CLIENT_SECRET,
  SESSION_SECRET,
  PORT,
};
