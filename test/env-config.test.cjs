const { test } = require('node:test');
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const path = require('node:path');
const modulePath = path.resolve(__dirname, '../src/web-app/env-config.js');
function run(settings, body) {
  const env = { ...process.env };
  for (const k of [
    'PORT',
    'SESSION_SECRET',
    'CODESPACE_NAME',
    'GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN',
  ])
    delete env[k];
  const r = spawnSync(
    process.execPath,
    ['-e', `const c=require(${JSON.stringify(modulePath)});${body}`],
    { env: { ...env, ...settings }, encoding: 'utf8' }
  );
  assert.equal(r.status, 0, r.stderr);
  return JSON.parse(r.stdout.trim().split('\n').at(-1));
}
const call = `let result={}; c.checkUrl()({headers:{host:process.env.TEST_HOST},originalUrl:'/callback?code=fixture&state=example'}, {redirect(status,url){result={status,url}}},()=>{result={next:true}}); console.log(JSON.stringify(result));`;
test('the public Codespaces hostname reaches the app', () =>
  assert.deepEqual(
    run(
      {
        CODESPACE_NAME: 'test-lab',
        GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN: 'app.github.dev',
        TEST_HOST: 'test-lab-37500.app.github.dev',
      },
      call
    ),
    { next: true }
  ));
test('localhost reaches the app', () =>
  assert.deepEqual(run({ TEST_HOST: 'localhost:37500' }, call), {
    next: true,
  }));
test('a mismatched host preserves callback data and redirects only to the configured origin', () =>
  assert.deepEqual(
    run(
      {
        CODESPACE_NAME: 'test-lab',
        GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN: 'app.github.dev',
        TEST_HOST: 'example.invalid',
      },
      call
    ),
    {
      status: 302,
      url: 'https://test-lab-37500.app.github.dev/callback?code=fixture&state=example',
    }
  ));
test('a partial host match is rejected', () =>
  assert.equal(run({ TEST_HOST: 'local' }, call).status, 302));
test('a custom port is respected', () =>
  assert.deepEqual(run({ PORT: '39001', TEST_HOST: 'localhost:39001' }, call), {
    next: true,
  }));
test('placeholder cookie keys are replaced and never logged', () => {
  const a = run(
    { SESSION_SECRET: 'a long, randomly-generated string stored in env' },
    'console.log(JSON.stringify(c.SESSION_SECRET))'
  );
  const b = run({}, 'console.log(JSON.stringify(c.SESSION_SECRET))');
  assert.match(a, /^[0-9a-f]{64}$/);
  assert.notEqual(a, b);
  const supplied = 'test-fixture-key-only-do-not-use-in-production';
  const r = spawnSync(
    process.execPath,
    ['-e', `require(${JSON.stringify(modulePath)})`],
    { env: { ...process.env, SESSION_SECRET: supplied }, encoding: 'utf8' }
  );
  assert.equal(r.status, 0);
  assert.ok(!r.stdout.includes(supplied));
  assert.equal(
    run(
      { SESSION_SECRET: supplied },
      'console.log(JSON.stringify(c.SESSION_SECRET))'
    ),
    supplied
  );
});
