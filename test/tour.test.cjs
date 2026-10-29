const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { completedSource } = require('./tour-helper.cjs');
test('all six guided edits produce valid code with both private routes protected', async () => {
  const { text, edits } = await completedSource();
  assert.equal(edits, 6);
  assert.match(text, /authRequired: false/);
  assert.match(text, /app.get\('\/user', requiresAuth\(\)/);
  assert.match(text, /app.get\('\/expenses', requiresAuth\(\)/);
});
test('every tour command exists in the extension or VS Code', () => {
  const allowed = new Set([
    'auth0.auth.signIn',
    'auth0.lab.localConfigure',
    'auth0.lab.openEndpointByName',
    'workbench.action.debug.start',
    'workbench.action.debug.stop',
    'workbench.action.terminal.new',
    'codetour.startTourByTitle',
  ]);
  const dir = path.resolve(__dirname, '../.auth0/lab/guides');
  for (const file of fs.readdirSync(dir)) {
    const text = fs.readFileSync(path.join(dir, file), 'utf8');
    JSON.parse(text);
    for (const m of text.matchAll(/command:([\w.]+)/g))
      assert.ok(allowed.has(m[1]), file + ': ' + m[1]);
  }
});
