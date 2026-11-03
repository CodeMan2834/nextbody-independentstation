import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import ts from 'typescript';
import { renderToStaticMarkup } from 'react-dom/server';
import React from 'react';
const require = createRequire(import.meta.url);
const { validate } = require('../public/admin/validation.js');
const source = fs.readFileSync(new URL('../public/google-analytics.js', import.meta.url), 'utf8');
function browser({ choice, hostname = 'nexbodyfit.com', pathname = '/', dnt, gpc, id = 'G-MGHS9TX3JG', storageBlocked = false } = {}) {
  const handlers = {}, tags = [], cookies = [];
  const storage = new Map(choice ? [['nexbody-google-analytics-consent', choice]] : []);
  const document = {
    cookie: '_ga=old; _ga_ABC=old; session=keep',
    querySelector: () => ({ dataset: { googleMeasurementId: id } }),
    createElement: () => ({}), head: { appendChild: tag => tags.push(tag) },
    addEventListener: (name, fn) => { handlers[name] = fn; },
  };
  Object.defineProperty(document, 'cookie', { get: () => '_ga=old; _ga_ABC=old; session=keep', set: value => cookies.push(value) });
  const sandbox = { document, location: { hostname, pathname, origin: 'https://' + hostname }, navigator: { doNotTrack: dnt, globalPrivacyControl: gpc }, URL, Date,
    localStorage: { getItem: key => { if (storageBlocked) throw Error('blocked'); return storage.get(key) || null; } },
    addEventListener: (name, fn) => { handlers[name] = fn; },
  };
  sandbox.window = sandbox;
  vm.runInNewContext(source, sandbox);
  return { sandbox, tags, storage, cookies, emit: (name, event = {}) => handlers[name]?.(event), commands: () => Array.from(sandbox.dataLayer || [], args => Array.from(args)) };
}
test('Google remains disconnected without consent, when declined, storage is blocked, privacy signals apply, or on local/admin pages', () => {
  for (const options of [{}, {choice:'denied'}, {choice:'granted',hostname:'localhost'}, {choice:'granted',pathname:'/admin/index.html'}, {choice:'granted',dnt:'1'}, {choice:'granted',gpc:true}, {storageBlocked:true}, {choice:'granted',id:'G-<script>'}]) {
    const b = browser(options);
    assert.equal(b.tags.length, 0);
    assert.equal(b.commands().length, 0);
  }
});
test('explicit consent loads exactly one GA tag, keeps advertising denied, and does not manually duplicate history page views', () => {
  const b = browser(); b.storage.set('nexbody-google-analytics-consent','granted'); b.emit('nexbody:google-consent');
  assert.equal(b.tags.length, 1);
  assert.equal(b.tags[0].src, 'https://www.googletagmanager.com/gtag/js?id=G-MGHS9TX3JG');
  const commands = b.commands();
  assert.equal(commands[0][0], 'consent'); assert.equal(commands[0][2].analytics_storage, 'denied');
  assert.equal(commands[1][2].analytics_storage, 'granted'); assert.equal(commands[1][2].ad_storage, 'denied');
  const config = commands.find(args => args[0] === 'config');
  assert.equal(config[2].allow_google_signals,false); assert.equal(config[2].allow_ad_personalization_signals,false);
  b.emit('nexbody:page'); b.emit('nexbody:page');
  assert.equal(b.tags.length, 1);
  assert.equal(b.commands().filter(args => args[1] === 'page_view').length, 0);
});
test('withdrawal disables future events and clears only accessible GA cookies', () => {
  const b = browser({choice:'granted'}); b.storage.set('nexbody-google-analytics-consent','denied'); b.emit('nexbody:google-consent');
  assert.equal(b.sandbox['ga-disable-G-MGHS9TX3JG'],true);
  const count = b.commands().length; b.emit('nexbody:inquiry-success'); assert.equal(b.commands().length,count);
  assert.ok(b.cookies.some(value => value.startsWith('_ga=;')));
  assert.ok(b.cookies.every(value => !value.startsWith('session=')));
});
test('inquiry and product events contain only fixed business labels, never form contents or arbitrary URLs', () => {
  const b = browser({choice:'granted'});
  b.emit('nexbody:inquiry-success',{detail:{email:'private@example.com',name:'Private Person',message:'secret'}});
  b.emit('click',{isTrusted:true,target:{closest:()=>({href:'https://nexbodyfit.com/products/nexbody-x60?email=private@example.com'})}});
  const events = b.commands().filter(args => args[0] === 'event');
  assert.deepEqual(events.map(args => args[1]),['generate_lead','select_content']);
  assert.equal(events[1][2].item_id,'nexbody-x60');
  assert.doesNotMatch(JSON.stringify(events),/private|secret|example\.com/);
  const count = events.length; b.emit('click',{isTrusted:false}); assert.equal(b.commands().filter(args=>args[0]==='event').length,count);
});
test('CMS rejects unsafe appearance settings and invalid GA configuration, while boolean false remains valid', () => {
  const config = JSON.parse(fs.readFileSync(new URL('../public/admin/config.yml',import.meta.url)));
  const fields = config.collections.find(c=>c.name==='settings').files[0].fields;
  const data = JSON.parse(fs.readFileSync(new URL('../content/site-settings.json',import.meta.url)));
  const off = structuredClone(data); off.googleAnalytics.enabled = false; assert.deepEqual(validate(off,fields,'settings'),[]);
  for (const mutate of [d=>d.typography.headingFont='url(https://evil.test)',d=>d.typography.bodyDesktop=100,d=>d.branding.desktopHeight=200,d=>d.branding.mode='custom',d=>d.googleAnalytics.measurementId='G-<script>',d=>d.googleAnalytics.enabled='true']) {
    const d = structuredClone(data); mutate(d); assert.ok(validate(d,fields,'settings').length);
  }
});
test('article renderer preserves natural paragraphs and headings while rejecting executable HTML and remote image trackers', () => {
  const code = ts.transpileModule(fs.readFileSync(new URL('../src/components/shared/ArticleBody.tsx',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText;
  const compiledModule = {exports:{}}; vm.runInNewContext(code,{module:compiledModule,exports:compiledModule.exports,require});
  const html = renderToStaticMarkup(React.createElement(compiledModule.exports.ArticleBody,{body:'A first paragraph.\n\nA second paragraph.\n\n## A useful heading\n\n[unsafe](javascript:alert(1))\n\n<script>alert(1)</script>\n\n![tracker](https://tracker.example/image.png)\n\n![local](/media/products/x60/x60-analysis.png)'}));
  assert.match(html,/<p>A first paragraph/); assert.match(html,/<p>A second paragraph/); assert.match(html,/<h2>A useful heading/);
  assert.doesNotMatch(html,/<script|javascript:|src="https:\/\/tracker/);
  assert.match(html,/src="\/media\/products\/x60\/x60-analysis.png"/);
  assert.equal(compiledModule.exports.articleUrl('/images/uploads/%E4%BA%A7%E5%93%81.png','src'),'/images/uploads/%E4%BA%A7%E5%93%81.png');
  assert.equal(compiledModule.exports.articleUrl('/images/%2e%2e/secret.png','src'),'');
});
