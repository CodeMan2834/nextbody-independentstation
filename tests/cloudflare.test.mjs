import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import ts from 'typescript';
const require=createRequire(import.meta.url),root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const {NextRequest}=require('next/server');
const fixture=()=>({totals:[{count:1000,sum:{edgeResponseBytes:8000000},avg:{sampleInterval:10}}],trend:[{count:1000,dimensions:{datetimeHour:'2026-10-25T10:00:00Z',date:'2026-10-25'}}],countries:[{count:400,dimensions:{clientCountryName:'US'}}],cache:[{count:600,dimensions:{cacheStatus:'hit'}},{count:400,dimensions:{cacheStatus:'dynamic'}}],statuses:[{count:940,dimensions:{edgeResponseStatus:200}},{count:50,dimensions:{edgeResponseStatus:404}},{count:10,dimensions:{edgeResponseStatus:502}}]});
const limits={enabled:true,maxDuration:31*86400,notOlderThan:31*86400,maxPageSize:1000};
function app({env={},upstream,permission=false,local=false}={}){
 const environment={NODE_ENV:'production',CMS_SITE_URL:'https://nexbodyfit.com',CLOUDFLARE_ZONE_ID:'a'.repeat(32),CLOUDFLARE_ANALYTICS_TOKEN:'fixture-secret-never-returned',...env};
 const modules=new Map(),calls=[];
 function load(file){if(!path.extname(file))file+='.ts';file=path.resolve(root,file);if(modules.has(file))return modules.get(file).exports;const result={exports:{}};modules.set(file,result);const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}}).outputText;
 const resolve=name=>name==='@/lib/analytics/session'?{ADMIN_COOKIE:'admin',authorised:async()=>permission}:name==='@/lib/analytics/config'?{analyticsSettings:()=>({sessionReady:true})}:name==='@/lib/admin-auth'?{localEditingAllowed:()=>local}:name.startsWith('@/')?load('src/'+name.slice(2)):require(name);
 vm.runInNewContext(code,{module:result,exports:result.exports,require:resolve,process:{env:environment},URL,Date,Map,Set,Response,Number,Object,JSON,AbortSignal,fetch:async(url,init)=>{const body=JSON.parse(init.body);calls.push({url,...body});if(upstream)return upstream(body,calls.length);return Response.json({data:{viewer:{zones:[body.query.includes('HealthSettings')?{settings:{httpRequestsAdaptiveGroups:limits}}:fixture()]}}});}});return result.exports;}
 return {load,calls,environment};
}
test('Cloudflare response uses estimated counts once, explicit cache denominator and independent error metrics',()=>{
 const a=app(),m=a.load('src/lib/analytics/cloudflare');const r=m.normalizeHealth(fixture(),'24h',Date.parse('2026-10-24T12:00:00Z'),Date.parse('2026-10-25T12:00:00Z'),'nexbodyfit.com');assert.equal(r.totals.requests,1000);assert.equal(r.totals.cacheHitRate,60);assert.equal(r.totals.serverErrorRate,1);assert.equal(r.totals.clientErrors,50);assert.equal(r.sampling,'sampled');assert.equal('pageviews' in r.totals,false);assert.equal('visitors' in r.totals,false);assert.equal(JSON.stringify(r).includes('fixture-secret'),false);
});
test('Cloudflare empty results preserve unknown percentages and malformed partial data fails rather than showing zero',()=>{
 const m=app().load('src/lib/analytics/cloudflare'),empty={totals:[],trend:[],countries:[],cache:[],statuses:[]};const r=m.normalizeHealth(empty,'24h',0,100000,'nexbodyfit.com');assert.equal(r.totals.requests,0);assert.equal(r.totals.cacheHitRate,null);assert.equal(r.totals.serverErrorRate,null);assert.throws(()=>m.normalizeHealth({...fixture(),statuses:null},'24h',0,100000,'nexbodyfit.com'));assert.throws(()=>m.normalizeHealth({...fixture(),trend:[{count:4}]},'24h',0,100000,'nexbodyfit.com'));const f=fixture();f.statuses=Array.from({length:100},(_,i)=>({count:1,dimensions:{edgeResponseStatus:i}}));assert.equal(m.normalizeHealth(f,'24h',0,100000,'nexbodyfit.com').totals.serverErrorRate,null);
});
test('Cloudflare settings and bounded range input reject invalid zone and arbitrary query ranges',()=>{
 const m=app().load('src/lib/analytics/cloudflare');assert.equal(m.cloudflareSettings({}).ready,false);assert.equal(m.cloudflareSettings({CLOUDFLARE_ANALYTICS_TOKEN:'private',CLOUDFLARE_ZONE_ID:'not-a-zone'}).ready,false);assert.throws(()=>m.healthRange(new URLSearchParams({range:'365d'})));assert.equal(m.healthRange(new URLSearchParams()),'24h');
});
test('Cloudflare endpoint enforces authorization independently of database configuration and never returns credentials',async()=>{
 const a=app(),GET=a.load('src/app/api/analytics/cloudflare/route').GET;let r=await GET(new NextRequest('https://nexbodyfit.com/api/analytics/cloudflare'));assert.equal(r.status,401);assert.equal(a.calls.length,0);assert.equal(r.headers.get('cache-control'),'no-store');
 const b=app({permission:true,env:{CLOUDFLARE_ANALYTICS_TOKEN:''}});r=await b.load('src/app/api/analytics/cloudflare/route').GET(new NextRequest('https://nexbodyfit.com/api/analytics/cloudflare'));const value=await r.json();assert.equal(value.state,'unconfigured');assert.equal('data' in value,false);assert.equal(b.calls.length,0);
 const c=app({local:true});r=await c.load('src/app/api/analytics/cloudflare/route').GET(new NextRequest('http://localhost:3008/api/analytics/cloudflare?range=garbage'));assert.equal(r.status,400);assert.equal(c.calls.length,0);
});
test('Cloudflare read caches successful results, deduplicates concurrent readers and limits hosts without customer data',async()=>{
 const a=app(),m=a.load('src/lib/analytics/cloudflare'),now=Date.parse('2026-10-25T12:00:00Z');const [one,two]=await Promise.all([m.cloudflareReport('24h',now),m.cloudflareReport('24h',now)]);assert.equal(a.calls.length,2);assert.equal(one.cached,false);assert.equal(two.cached,true);const three=await m.cloudflareReport('24h',now+1000);assert.equal(three.cached,true);assert.equal(a.calls.length,2);await m.cloudflareReport('24h',now+301000);assert.equal(a.calls.length,4);const q=a.calls[1].query;assert.match(q,/requestSource: "eyeball"/);assert.match(q,/clientRequestHTTPHost_in: \["nexbodyfit.com","www.nexbodyfit.com"\]/);assert.equal(/clientIP|userAgent|QueryString/.test(q),false);assert.equal(JSON.stringify(one).includes('fixture-secret'),false);
});
test('Cloudflare does not treat HTTP 200 GraphQL errors, partial responses or empty zone access as valid data',async()=>{
 for(const payload of [{errors:[{message:'not authorized for that zone'}]},{data:{viewer:{zones:[]}}},{data:{viewer:{zones:[{}]}},errors:[{message:'unknown field'}]}]){const a=app({upstream:()=>Response.json(payload)});await assert.rejects(()=>a.load('src/lib/analytics/cloudflare').cloudflareReport('24h'),e=>['permission','response'].includes(e.code));}
});
test('Cloudflare rejects unavailable or over-limit datasets before querying metrics and surfaces upstream failures safely',async()=>{
 for(const value of [{...limits,enabled:false},{...limits,maxDuration:3600}]){const a=app({upstream:()=>Response.json({data:{viewer:{zones:[{settings:{httpRequestsAdaptiveGroups:value}}]}}})});await assert.rejects(()=>a.load('src/lib/analytics/cloudflare').cloudflareReport('7d'),e=>e.code==='limited');assert.equal(a.calls.length,1);}
 for(const status of [403,429,500]){const a=app({permission:true,upstream:()=>new Response('fixture-secret-never-returned',{status})}),r=await a.load('src/app/api/analytics/cloudflare/route').GET(new NextRequest('https://nexbodyfit.com/api/analytics/cloudflare'));assert.equal(r.status,503);const value=await r.json();assert.equal('data' in value,false);assert.equal(JSON.stringify(value).includes('fixture-secret'),false);}
});
test('Cloudflare credential rotation invalidates cached data and does not reuse the previous token result',async()=>{
 const a=app(),m=a.load('src/lib/analytics/cloudflare');await m.cloudflareReport('24h');a.environment.CLOUDFLARE_ANALYTICS_TOKEN='rotated-fixture';assert.equal((await m.cloudflareReport('24h')).cached,false);assert.equal(a.calls.length,4);
});
