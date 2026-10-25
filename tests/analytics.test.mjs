import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import ts from 'typescript';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const require=createRequire(import.meta.url);
const {NextRequest}=require('next/server');
const secret='analytics-local-test-secret-32-characters';
const schema=fs.readFileSync(path.join(root,'db/analytics.sql'),'utf8');

function app(overrides={}) {
  const directory=fs.mkdtempSync(path.join(os.tmpdir(),'nexbody-analytics-'));
  const environment={NODE_ENV:'development',ANALYTICS_ENABLED:'true',TURSO_DATABASE_URL:'file:'+path.join(directory,'test.db').replaceAll('\\','/'),ADMIN_SESSION_SECRET:secret,...overrides};
  const cache=new Map();let cookieValue,headersValue=new Headers();let permission=true;let fetchHandler=async()=>Response.json({permissions:{push:permission}});
  function load(relative) {
    let file=path.resolve(root,relative);
    if(!path.extname(file))file+='.ts';
    if(file.endsWith('.json'))return JSON.parse(fs.readFileSync(file,'utf8'));
    if(cache.has(file))return cache.get(file).exports;
    const result={exports:{}};cache.set(file,result);
    const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText;
    const resolve=name=>{
      if(name==='next/headers')return {cookies:async()=>({get:()=>cookieValue?{value:cookieValue}:undefined,has:()=>false}),headers:async()=>headersValue};
      if(name.startsWith('@/'))return load('src/'+name.slice(2));
      if(name.startsWith('.'))return load(path.resolve(path.dirname(file),name));
      return require(name);
    };
    vm.runInNewContext(code,{module:result,exports:result.exports,require:resolve,process:{env:environment},Buffer,URL,URLSearchParams,Response,Request,Headers,AbortSignal,TextEncoder,console,fetch:(...args)=>fetchHandler(...args)},{filename:file});
    return result.exports;
  }
  return {load,environment,directory,setCookie:value=>cookieValue=value,setFetch:fn=>fetchHandler=fn,setPermission:value=>permission=value,setHeaders:value=>headersValue=new Headers(value),close(){cache.get(path.join(root,'src/lib/analytics/db.ts'))?.exports.closeDatabase?.();assert.equal(path.dirname(directory),os.tmpdir());assert.ok(path.basename(directory).startsWith('nexbody-analytics-'));try{fs.rmSync(directory,{recursive:true,force:true});}catch(error){if(error.code!=='EBUSY')throw error;}}};
}
const visit=(id=randomUUID())=>({id,channel:'search',source:'google.com',medium:'organic',campaign:'',entry_path:'/products/nexbody-x60',device:'desktop'});
const event=(kind='pageview',path='/products/nexbody-x60',module='page',action='')=>({id:randomUUID(),kind,path,module,action});
function request(body,headers={}) {return new NextRequest('http://localhost:3008/api/analytics/collect',{method:'POST',headers:{origin:'http://localhost:3008','content-type':'application/json','user-agent':'Mozilla/5.0',...headers},body:JSON.stringify(body)});}

test('production rejects local database URLs and preview environments never enable collection',()=>{
 const a=app();try{const {analyticsSettings}=a.load('src/lib/analytics/config');
  assert.equal(analyticsSettings({...a.environment,NODE_ENV:'production'}).enabled,false);
  const remote={...a.environment,NODE_ENV:'production',TURSO_DATABASE_URL:'libsql://example.turso.io',TURSO_AUTH_TOKEN:'private'};
  assert.equal(analyticsSettings(remote).enabled,true);assert.equal(analyticsSettings({...remote,VERCEL_ENV:'preview'}).enabled,false);
  assert.equal(analyticsSettings({...remote,TURSO_DATABASE_URL:'https://example.turso.io.evil.test'}).database,false);
 }finally{a.close();}
});
test('admin and visitor cookies reject tampering, expiry and the wrong secret; tokens remain encrypted',()=>{
 const a=app();try{const s=a.load('src/lib/analytics/session'),now=Date.now();const token=s.sealAdmin('private-github-token',secret,now);
 assert.equal(token.includes('private-github-token'),false);assert.equal(s.openAdmin(token,secret,now),'private-github-token');
 assert.equal(s.openAdmin(token,'different-secret-with-32-characters',now),null);assert.equal(s.openAdmin(token.slice(0,-4)+'abcd',secret,now),null);assert.equal(s.openAdmin(token,secret,now+8*3600000),null);
 const id=randomUUID(),cookie=s.signVisit(id,secret,now);assert.equal(s.openVisit(cookie,secret,now),id);assert.equal(s.openVisit(cookie,secret,now+1800001),null);assert.equal(s.openVisit(cookie,secret+'x',now),null);
 }finally{a.close();}
});
test('attribution uses allowlisted campaign tags and only referral domains, never email/query strings',()=>{
 const a=app();try{const {attribution}=a.load('src/lib/analytics/model');
 assert.equal(attribution({source:'Instagram',medium:'social',campaign:'expo_2026'},'https://nexbodyfit.com').campaign,'expo_2026');
 const result=attribution({source:'customer@example.com',campaign:'<script>',referrer:'https://www.google.com/search?q=private'},'https://nexbodyfit.com');assert.equal(result.channel,'search');assert.equal(JSON.stringify(result).includes('private'),false);
 assert.equal(attribution({referrer:'https://nexbodyfit.com/products'},'https://nexbodyfit.com').channel,'direct');
 assert.equal(attribution({referrer:'https://notgoogle.com.evil.test/'},'https://nexbodyfit.com').channel,'referral');
 }finally{a.close();}
});
test('cookieless aggregates deduplicate retries without sessions and filter pages rather than visitor cohorts',async()=>{
 const a=app();try{const db=a.load('src/lib/analytics/db');await db.database().executeMultiple(schema);await db.database().executeMultiple(schema);
 const context=visit(),now=Date.now()-10000,first=event();await db.saveAggregateEvents(context,[first],now);await db.saveAggregateEvents(context,[first],now);
 await db.saveAggregateEvents(context,[event('impression','/products/nexbody-x60','product_cta'),event('click','/products/nexbody-x60','product_cta','consultation')],now+1000);
 await db.saveAggregateEvents(context,[event('pageview','/contact')],now+2000);const success=randomUUID();await db.saveAggregateInquiry(success);await db.saveAggregateInquiry(success);
 await db.saveAggregateEvents({...visit(),channel:'direct',source:'direct',medium:''},[event('pageview','/')],now+3000);
 const result=await a.load('src/lib/analytics/report').report(new URLSearchParams());
 assert.equal(result.mode,'aggregate');assert.equal('sessions' in result.totals,false);assert.equal(result.totals.pageviews,3);assert.equal(result.totals.clicks,1);assert.equal(result.totals.consultations,1);assert.equal(result.totals.inquiries,1);
 assert.equal(result.funnel.product,1);assert.equal(result.funnel.contact,1);assert.equal(result.funnel.success,1);
 assert.equal(result.modules[0].exposures,1);assert.equal(result.modules[0].clicks,1);
 const product=await a.load('src/lib/analytics/report').report(new URLSearchParams({product:'nexbody-x60'}));assert.equal(product.totals.pageviews,1);assert.equal(product.totals.inquiries,0);
 const source=await a.load('src/lib/analytics/report').report(new URLSearchParams({channel:'search'}));assert.equal(source.totals.inquiries,0);
 assert.equal((await db.database().execute('SELECT COUNT(*) n FROM analytics_sessions')).rows[0].n,0);
 const columns=await db.database().execute('PRAGMA table_info(analytics_aggregate_events)');assert.equal(columns.rows.some(x=>['sid','visitor_id','ip'].includes(x.name)),false);
 await assert.rejects(()=>a.load('src/lib/analytics/report').report(new URLSearchParams({channel:"'; DROP TABLE analytics_counts"})));
 }finally{a.close();}
});
test('collector rejects cross-origin, forged inquiries, unknown modules and oversized payloads before storing',async()=>{
 const a=app();try{await a.load('src/lib/analytics/db').database().executeMultiple(schema);const {POST}=a.load('src/app/api/analytics/collect/route');
 const body={mode:'aggregate',events:[event()]};
 assert.equal((await POST(request(body,{origin:'https://evil.test'}))).status,403);
 assert.equal((await POST(request({...body,events:[event('inquiry')]}))).status,400);
 assert.equal((await POST(request({...body,events:[event('click','/','constructor','navigate')]}))).status,400);
 assert.equal((await POST(request({...body,events:[event('pageview','/admin')]}))).status,400);
 assert.equal((await POST(request(body,{'content-length':'15000'}))).status,413);
 assert.equal((await POST(request({...body,optOut:true}))).status,400);
 assert.equal((await POST(request(body,{dnt:'1'}))).status,204);
 assert.equal((await POST(request(body,{'user-agent':'Googlebot'}))).status,204);
 assert.equal((await POST(request(body,{'sec-gpc':'1'}))).status,204);
 const count=await a.load('src/lib/analytics/db').database().execute('SELECT COUNT(*) n FROM analytics_aggregate_events');assert.equal(count.rows[0].n,0);
 const accepted=await POST(request(body));assert.equal(accepted.status,204);assert.match(accepted.headers.get('set-cookie'),/Max-Age=0/i);assert.equal(accepted.cookies.get('nexbody-analytics-visit').value,'');
 const d=a.load('src/lib/analytics/db');assert.equal((await d.database().execute('SELECT COUNT(*) n FROM analytics_sessions')).rows[0].n,0);
 }finally{a.close();}
});
test('rate limit is database-backed and stores no raw IP address',async()=>{
 const a=app();try{const d=a.load('src/lib/analytics/db');await d.database().executeMultiple(schema);
 const now=Date.now();for(let n=0;n<120;n++)assert.equal(await d.rateAllowed('192.0.2.1',now),true);assert.equal(await d.rateAllowed('192.0.2.1',now),false);
 const rows=await d.database().execute('SELECT * FROM analytics_limits');assert.equal(rows.rows.length,1);assert.equal(JSON.stringify(rows.rows).includes('192.0.2.1'),false);
 }finally{a.close();}
});
test('retention keeps old daily totals after raw events expire, then removes summaries beyond a year',async()=>{
 const a=app();try{const d=a.load('src/lib/analytics/db');await d.database().executeMultiple(schema);const now=Date.now();await d.saveEvents(visit(),[event()],now-91*86400000);await d.saveEvents(visit(),[event()],now-367*86400000);await d.cleanup(now);
 assert.equal((await d.database().execute('SELECT COUNT(*) n FROM analytics_events')).rows[0].n,0);assert.equal((await d.database().execute('SELECT COUNT(*) n FROM analytics_daily')).rows[0].n,1);assert.equal((await d.database().execute('SELECT COUNT(*) n FROM analytics_sessions')).rows[0].n,1);
 }finally{a.close();}
});
test('analytics query requires server-side permission in production; local unconfigured state is explicit',async()=>{
 const a=app({NODE_ENV:'production'});try{const {GET}=a.load('src/app/api/analytics/report/route');const response=await GET(new NextRequest('https://nexbodyfit.com/api/analytics/report'));assert.equal(response.status,401);assert.equal((await response.json()).state,'unauthorised');
 const s=a.load('src/lib/analytics/session');a.setPermission(false);assert.equal(await s.authorised(s.sealAdmin('readonly',secret)),false);
 a.setPermission(true);assert.equal(await s.authorised(s.sealAdmin('writer',secret)),true);
 }finally{a.close();}
 const b=app({ANALYTICS_ENABLED:'false'});try{const response=await b.load('src/app/api/analytics/report/route').GET(new NextRequest('http://localhost:3008/api/analytics/report'));assert.equal((await response.json()).state,'unconfigured');}finally{b.close();}
});
test('inquiry statistics ignores missing event identifiers and database failure without rejecting the form',async()=>{
 const a=app();try{const {recordSuccessfulInquiry}=a.load('src/lib/analytics/inquiry');await assert.doesNotReject(()=>recordSuccessfulInquiry(undefined));await assert.doesNotReject(()=>recordSuccessfulInquiry('invalid'));
 const session=a.load('src/lib/analytics/session');a.setCookie(session.signVisit(randomUUID(),secret));await assert.doesNotReject(()=>recordSuccessfulInquiry(randomUUID()));
 }finally{a.close();}
});
test('backup and restore preserve real rows and reject overwriting an existing database',async()=>{
 const a=app();let restored;try{const d=a.load('src/lib/analytics/db');await d.database().executeMultiple(schema);await d.saveEvents(visit(),[event()]);await d.saveAggregateEvents(visit(),[event()]);d.database().close();
 const backup=path.join(a.directory,'snapshot.json');const run=(mode,file,url=a.environment.TURSO_DATABASE_URL)=>spawnSync(process.execPath,['scripts/analytics-database.mjs',mode,file],{cwd:root,env:{...process.env,...a.environment,TURSO_DATABASE_URL:url},encoding:'utf8'});
 const result=run('backup',backup);assert.equal(result.status,0,result.stderr);assert.equal(run('backup',backup).status,1);
 const restoredURL='file:'+path.join(a.directory,'restored.db').replaceAll('\\','/');const restore=run('restore',backup,restoredURL);assert.equal(restore.status,0,restore.stderr);assert.equal(run('restore',backup,restoredURL).status,1);
 restored=require('@libsql/client').createClient({url:restoredURL});assert.equal((await restored.execute('SELECT SUM(count) n FROM analytics_daily')).rows[0].n,1);assert.equal((await restored.execute('SELECT SUM(count) n FROM analytics_counts')).rows[0].n,1);
 }finally{restored?.close();a.close();}
});


test('dashboard OAuth creates an encrypted server cookie only after repository write permission passes',async()=>{
 const a=app({CMS_AUTH_MODE:'github',CMS_SITE_URL:'https://nexbodyfit.com',CMS_GITHUB_CLIENT_ID:'client',CMS_GITHUB_CLIENT_SECRET:'test-secret'});
 try{let calls=0;a.setFetch(async()=>Response.json(++calls===1?{access_token:'only-server-sees-this'}:{permissions:{push:true}}));
 const state='a'.repeat(64);const request=new NextRequest('https://nexbodyfit.com/api/admin/callback?code=test&state='+state,{headers:{cookie:'nexbody-cms-oauth='+state+'; nexbody-analytics-login=analytics'}});
 const response=await a.load('src/app/api/admin/callback/route').GET(request);assert.equal(response.status,303);assert.equal(response.headers.get('location'),'https://nexbodyfit.com/admin/analytics.html');
 const session=a.load('src/lib/analytics/session');const cookie=response.cookies.get(session.ADMIN_COOKIE);assert.ok(cookie);assert.equal(session.openAdmin(cookie.value,secret),'only-server-sees-this');assert.equal((await response.text()).includes('only-server-sees-this'),false);assert.match(response.headers.get('set-cookie'),/HttpOnly/);assert.match(response.headers.get('set-cookie'),/Secure/);
 }finally{a.close();}
});

test('protected maintenance endpoint rejects missing or incorrect scheduler credentials',async()=>{
 const a=app({CRON_SECRET:'maintenance-test-secret-at-least-32-chars'});try{const {GET}=a.load('src/app/api/analytics/maintenance/route');
 for(const authorization of ['', 'Bearer wrong'])assert.equal((await GET(new NextRequest('http://localhost:3008/api/analytics/maintenance',{headers:{authorization}}))).status,401);
 }finally{a.close();}
});


test('invalid dates and manipulated filters fail before database queries',async()=>{
 const a=app();try{const {dayAt,dateRange}=a.load('src/lib/analytics/model');assert.equal(dayAt(Date.parse('2026-10-21T16:00:00Z')),'2026-10-22');
 assert.throws(()=>dateRange(new URLSearchParams({from:'2026-02-30',to:'2026-03-01'})));assert.throws(()=>dateRange(new URLSearchParams({to:dayAt(Date.now()+86400000)})));
 const {GET}=a.load('src/app/api/analytics/report/route');assert.equal((await GET(new NextRequest('http://localhost:3008/api/analytics/report?device=unknown'))).status,400);
 }finally{a.close();}
});

test('aggregate retention preserves daily counts after raw events expire',async()=>{
 const a=app();try{const d=a.load('src/lib/analytics/db');await d.database().executeMultiple(schema);const now=Date.now();
 await d.saveAggregateEvents(visit(),[event()],now-91*86400000);await d.saveAggregateEvents(visit(),[event()],now-367*86400000);await d.cleanup(now);
 assert.equal((await d.database().execute('SELECT COUNT(*) n FROM analytics_aggregate_events')).rows[0].n,0);assert.equal((await d.database().execute('SELECT SUM(count) n FROM analytics_counts')).rows[0].n,1);
 }finally{a.close();}
});
test('successful inquiry is counted without a visitor cookie and privacy signals suppress it',async()=>{
 const a=app();try{const d=a.load('src/lib/analytics/db');await d.database().executeMultiple(schema);const {recordSuccessfulInquiry}=a.load('src/lib/analytics/inquiry');
 const id=randomUUID();await recordSuccessfulInquiry(id);await recordSuccessfulInquiry(id);a.setHeaders({dnt:'1'});await recordSuccessfulInquiry(randomUUID());a.setHeaders({'sec-gpc':'1'});await recordSuccessfulInquiry(randomUUID());
 assert.equal((await d.database().execute('SELECT COUNT(*) n FROM analytics_aggregate_events')).rows[0].n,1);assert.equal((await d.database().execute('SELECT COUNT(*) n FROM analytics_sessions')).rows[0].n,0);
 }finally{a.close();}
});

test('public collector defaults to anonymous counts, honours old refusals, and ignores programmatic video playback',async()=>{
 async function run(initial={}){
  const values=new Map(Object.entries(initial)),listeners=new Map(),timers=[],calls=[];
  const control={textContent:'',disabled:false,setAttribute(){},closest(selector){return selector==='[data-analytics-toggle]'?this:null;}};
  const document={referrer:'',documentElement:{dataset:{}},hidden:false,querySelectorAll:selector=>selector==='[data-analytics-toggle]'?[control]:[],addEventListener:(name,fn)=>{const list=listeners.get(name)||[];list.push(fn);listeners.set(name,list);}};
  class Video {autoplay=false;closest(){return null;}}
  const context={window:{},document,navigator:{},location:{pathname:'/',search:'',origin:'https://nexbodyfit.com'},localStorage:{getItem:key=>values.get(key)||null,setItem:(k,v)=>values.set(k,v),removeItem:k=>values.delete(k)},crypto:{randomUUID},URL,URLSearchParams,AbortSignal,Date,HTMLVideoElement:Video,WeakMap,Set,Map,IntersectionObserver:class {disconnect(){}observe(){}},setTimeout:fn=>{timers.push(fn);return timers.length;},clearTimeout(){},addEventListener(){},fetch:async(url,options)=>{calls.push({url,options});return {ok:true};}};
  vm.runInNewContext(fs.readFileSync(path.join(root,'public/analytics.js'),'utf8'),context);
  async function flush(){for(let i=0;timers.length&&i<30;i++){await timers.shift()();await Promise.resolve();}}
  const emit=(name,event)=>{for(const fn of listeners.get(name)||[])fn(event);};
  await flush();return {calls,emit,flush,Video,control,document,values};
 }
 const a=await run();const payloads=()=>a.calls.filter(x=>x.url.endsWith('/collect')).flatMap(x=>JSON.parse(x.options.body).events);
 assert.equal(payloads().filter(e=>e.kind==='pageview').length,1);assert.equal(a.values.size,0);assert.equal(a.control.textContent,'Disable basic analytics');
 const video=new a.Video();a.emit('play',{target:video});await a.flush();assert.equal(payloads().filter(e=>e.action==='video_play').length,0);
 a.emit('pointerdown',{isTrusted:true,target:video});a.emit('play',{target:video});await a.flush();assert.equal(payloads().filter(e=>e.action==='video_play').length,1);
 a.emit('play',{target:video});await a.flush();assert.equal(payloads().filter(e=>e.action==='video_play').length,1);
 const before=payloads().length;a.emit('click',{target:a.control,preventDefault(){}});a.emit('play',{target:video});await a.flush();assert.equal(payloads().length,before);assert.equal(a.document.documentElement.dataset.analyticsDisabled,'true');
 const b=await run({'nexbody-analytics-consent':'denied'});assert.equal(b.calls.some(x=>x.url.endsWith('/collect')),false);assert.equal(b.control.textContent,'Enable basic analytics');
});
