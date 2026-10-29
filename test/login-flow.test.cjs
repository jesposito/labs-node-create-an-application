const { test } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const crypto = require('node:crypto');
const vm = require('node:vm');
const { createRequire } = require('node:module');
const path = require('node:path');
const { completedSource } = require('./tour-helper.cjs');
const listen = (s) =>
  new Promise((r) => s.listen(0, '127.0.0.1', () => r(s.address().port)));
const close = (s) =>
  new Promise((r) => {
    s.closeAllConnections();
    s.close(r);
  });
const request = (port, url, cookie = '') =>
  new Promise((resolve, reject) => {
    http
      .get(
        {
          hostname: '127.0.0.1',
          port,
          path: url,
          headers: { host: `localhost:${port}`, cookie },
        },
        (r) => {
          let body = '';
          r.on('data', (b) => (body += b));
          r.on('end', () =>
            resolve({ status: r.statusCode, headers: r.headers, body })
          );
        }
      )
      .on('error', reject);
  });
test('completed tour supports login, protected routes, logout and rejected callback state with a local OIDC fixture', async () => {
  const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
  });
  const jwk = {
    ...publicKey.export({ format: 'jwk' }),
    kid: 'lab-test',
    use: 'sig',
    alg: 'RS256',
  };
  let issuer,
    nonce,
    server,
    tokenRequests = 0;
  const provider = http.createServer((req, res) => {
    res.setHeader('content-type', 'application/json');
    if (req.url === '/.well-known/openid-configuration')
      return res.end(
        JSON.stringify({
          issuer,
          authorization_endpoint: issuer + '/authorize',
          token_endpoint: issuer + '/token',
          jwks_uri: issuer + '/jwks',
          end_session_endpoint: issuer + '/logout',
          response_types_supported: ['code'],
          subject_types_supported: ['public'],
          id_token_signing_alg_values_supported: ['RS256'],
          token_endpoint_auth_methods_supported: [
            'client_secret_basic',
            'client_secret_post',
          ],
        })
      );
    if (req.url === '/jwks') return res.end(JSON.stringify({ keys: [jwk] }));
    if (req.url === '/token') {
      tokenRequests++;
      let body = '';
      req.on('data', (d) => (body += d));
      return req.on('end', () => {
        const params = new URLSearchParams(body);
        assert.equal(params.get('code'), 'fixture-code');
        const now = Math.floor(Date.now() / 1000);
        const encode = (o) =>
          Buffer.from(JSON.stringify(o)).toString('base64url');
        const unsigned =
          encode({ alg: 'RS256', kid: 'lab-test' }) +
          '.' +
          encode({
            iss: issuer,
            sub: 'fixture-user',
            aud: 'fixture-client',
            iat: now,
            exp: now + 300,
            nonce,
            name: 'Lab Learner',
            email: 'learner@example.invalid',
          });
        const jwt =
          unsigned +
          '.' +
          crypto
            .sign('RSA-SHA256', Buffer.from(unsigned), privateKey)
            .toString('base64url');
        res.end(
          JSON.stringify({
            access_token: 'fixture-access',
            token_type: 'Bearer',
            expires_in: 300,
            id_token: jwt,
          })
        );
      });
    }
    res.statusCode = 404;
    res.end('{}');
  });
  issuer = `http://127.0.0.1:${await listen(provider)}`;
  const probe = http.createServer();
  const port = await listen(probe);
  await close(probe);
  const appDir = path.resolve(__dirname, '../src/web-app');
  const realRequire = createRequire(path.join(appDir, 'index.js'));
  const { text } = await completedSource();
  const config = {
    checkUrl: () => (_req, _res, next) => next(),
    APP_URL: `http://localhost:${port}`,
    ISSUER_BASE_URL: issuer,
    CLIENT_ID: 'fixture-client',
    CLIENT_SECRET: 'fixture-secret',
    SESSION_SECRET: crypto.randomBytes(32).toString('hex'),
    PORT: port,
  };
  const originalSecret = process.env.CLIENT_SECRET;
  process.env.CLIENT_SECRET = config.CLIENT_SECRET;
  try {
    vm.runInNewContext(text, {
      require(name) {
        if (name === './env-config') return config;
        if (name === 'http')
          return {
            createServer(app) {
              server = http.createServer(app);
              return server;
            },
          };
        return realRequire(name);
      },
      __dirname: appDir,
      console: { log() {} },
      process,
    });
    if (!server.listening)
      await new Promise((r) => server.once('listening', r));
    let r = await request(port, '/');
    assert.equal(r.status, 200);
    assert.match(r.body, /Anonymous/);
    r = await request(port, '/expenses');
    assert.equal(r.status, 302);
    let auth = new URL(r.headers.location);
    assert.equal(auth.origin, issuer);
    assert.equal(auth.searchParams.get('response_type'), 'code');
    assert.equal(
      auth.searchParams.get('redirect_uri'),
      `http://localhost:${port}/callback`
    );
    nonce = auth.searchParams.get('nonce');
    const jar = new Map();
    const store = (r) => {
      for (const c of r.headers['set-cookie'] || []) {
        const item = c.split(';')[0],
          i = item.indexOf('=');
        jar.set(item.slice(0, i), item.slice(i + 1));
      }
    };
    const cookies = () => [...jar].map(([k, v]) => k + '=' + v).join('; ');
    store(r);
    r = await request(
      port,
      '/callback?code=fixture-code&state=' +
        encodeURIComponent(auth.searchParams.get('state')),
      cookies()
    );
    assert.equal(r.status, 302, r.body);
    store(r);
    assert.equal(tokenRequests, 1);
    r = await request(port, '/expenses', cookies());
    assert.equal(r.status, 200);
    assert.match(r.body, /Pizza/);
    r = await request(port, '/user', cookies());
    assert.equal(r.status, 200);
    assert.match(r.body, /Lab Learner/);
    r = await request(port, '/logout', cookies());
    assert.equal(r.status, 302);
    store(r);
    assert.equal(new URL(r.headers.location).origin, issuer);
    r = await request(port, '/expenses', cookies());
    assert.equal(r.status, 302);
    store(r);
    r = await request(
      port,
      '/callback?code=fixture-code&state=wrong',
      cookies()
    );
    assert.equal(r.status, 400);
    assert.equal(tokenRequests, 1);
  } finally {
    if (originalSecret === undefined) delete process.env.CLIENT_SECRET;
    else process.env.CLIENT_SECRET = originalSecret;
    if (server) await close(server);
    await close(provider);
  }
});
