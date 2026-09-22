import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import ts from 'typescript';
import * as zod from 'zod';
import { fileURLToPath } from 'node:url';

const testDirectory = path.dirname(fileURLToPath(import.meta.url));

const inquiry = {
  fullName: 'Test Customer', email: 'customer@example.com', phone: '+12025550123',
  company: 'Test Company', country: 'Other', message: '<script>test</script>',
};

function setup({ env = {}, response = { data: { id: 'test-id' }, error: null }, fail = false } = {}) {
  const calls = [];
  const logs = [];
  const environment = { NODE_ENV: 'production', RESEND_API_KEY: 'test-key', EMAIL_FROM: 'NEXBODY <inquiry@example.com>', EMAIL_TO: 'sales@example.com', ...env };
  class FakeResend {
    emails = { send: async (payload) => {
      calls.push(payload);
      if (fail) throw new Error('Network unavailable');
      return response;
    } };
  }
  function load(relativePath, dependencies) {
    const filename = path.join(testDirectory, '..', relativePath);
    const compiled = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    }).outputText;
    const testModule = { exports: {} };
    vm.runInNewContext(compiled, {
      exports: testModule.exports, module: testModule,
      require: (name) => {
        if (!(name in dependencies)) throw new Error(`Unexpected dependency: ${name}`);
        return dependencies[name];
      },
      process: { env: environment },
      console: { error: (...values) => logs.push(values.join(' ')), log: (...values) => logs.push(values.join(' ')) },
    }, { filename });
    return testModule.exports;
  }
  const email = load('src/lib/email.ts', { resend: { Resend: FakeResend }, '@/lib/site-config': { siteConfig: { contactEmail: 'current@example.com' } } });
  const action = load('src/actions/submit-inquiry.ts', { zod, '@/lib/email': email });
  return { ...action, calls, logs };
}

test('missing API key returns failure without logging customer data or sending', async () => {
  for (const mode of ['production', 'development']) {
    const app = setup({ env: { NODE_ENV: mode, RESEND_API_KEY: '' } });
    assert.equal((await app.submitInquiry(inquiry)).success, false);
    assert.equal(app.calls.length, 0);
    assert.ok(!app.logs.join('').includes(inquiry.email));
  }
});

test('the CMS contact is used even when legacy mail variables are missing', async () => {
  const app = setup({ env: { EMAIL_FROM: '', EMAIL_TO: '' } });
  assert.equal((await app.submitInquiry(inquiry)).success, true);
  assert.equal(app.calls[0].from, 'NEXBODY <current@example.com>');
  assert.equal(app.calls[0].to, 'current@example.com');
});

test('provider rejection and missing acknowledgement are failures', async () => {
  for (const response of [{ data: null, error: { name: 'validation_error', message: 'Rejected' } }, { data: null, error: null }]) {
    const app = setup({ response });
    assert.equal((await app.submitInquiry(inquiry)).success, false);
    assert.equal(app.calls.length, 1);
  }
});

test('network exception returns a safe form error', async () => {
  const app = setup({ fail: true });
  const result = await app.submitInquiry(inquiry);
  assert.equal(result.success, false);
  assert.ok(!result.error.includes('Network unavailable'));
});

test('legacy mail variables cannot override the CMS contact; reply address and HTML are preserved', async () => {
  const app = setup();
  assert.equal((await app.submitInquiry(inquiry)).success, true);
  assert.equal(app.calls.length, 1);
  assert.equal(app.calls[0].from, 'NEXBODY <current@example.com>');
  assert.equal(app.calls[0].to, 'current@example.com');
  assert.equal(app.calls[0].replyTo, inquiry.email);
  assert.ok(app.calls[0].html.includes('&lt;script&gt;'));
});

test('invalid customer data never reaches the email provider', async () => {
  const app = setup();
  assert.equal((await app.submitInquiry({ ...inquiry, email: 'invalid' })).success, false);
  assert.equal(app.calls.length, 0);
});
