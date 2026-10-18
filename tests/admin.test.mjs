import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createRequire} from 'node:module';
import ts from 'typescript';
import * as crypto from 'node:crypto';
const require=createRequire(import.meta.url);
const {validate}=require('../public/admin/validation.js');
const root=new URL('../',import.meta.url);
const config=JSON.parse(fs.readFileSync(new URL('public/admin/config.yml',root)));
const content=name=>{
 const c=config.collections.find(c=>c.name===name), file=c.files[0];
 return {fields:file.fields,data:JSON.parse(fs.readFileSync(new URL(file.file,root)))};
};
function load(file,dependencies,extras={}){
 const compiled=ts.transpileModule(fs.readFileSync(new URL(file,root),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 const m={exports:{}};
 vm.runInNewContext(compiled,{module:m,exports:m.exports,require:n=>{if(!(n in dependencies))throw Error('Unexpected dependency '+n);return dependencies[n];},process:{env:{}},Buffer,URL,URLSearchParams,Response,AbortSignal,console,...extras});
 return m.exports;
}
const auth=load('src/lib/admin-auth.ts',{'node:crypto':crypto});
const env={NODE_ENV:'production',CMS_AUTH_MODE:'github',CMS_GITHUB_CLIENT_ID:'test-client',CMS_GITHUB_CLIENT_SECRET:'test-secret',CMS_SITE_URL:'https://nexbodyfit.com'};
class FakeResponse extends Response{
 cookies={values:[],set:(...v)=>this.cookies.values.push(v)};
 static redirect(url){return new FakeResponse(null,{status:307,headers:{Location:String(url)}});}
}
const request=(url,cookie)=>({url,nextUrl:new URL(url),cookies:{get:()=>cookie?{value:cookie}:undefined}});
function callback(fetch,environment=env){
 return load('src/app/api/admin/callback/route.ts',{'next/server':{NextResponse:FakeResponse},'@/lib/admin-auth':{...auth,adminSettings:()=>auth.adminSettings(environment)}},{fetch}).GET;
}

test('all five CMS collections validate existing content',()=>{
 for(const c of config.collections){const {data,fields}=content(c.name);assert.deepEqual(validate(data,fields,c.name),[],c.name);}
 assert.equal(config.collections.length,5);
});
test('protected products cannot be removed, duplicated, renamed or demoted',()=>{
 const {data,fields}=content('products');
 for(const mutate of [d=>d.products.pop(),d=>d.products[0].slug='other',d=>d.products[1].slug=d.products[0].slug,d=>d.products[0].priority='supporting']){
  const d=structuredClone(data);mutate(d);assert.ok(validate(d,fields,'products').length);
 }
});
test('dangerous links, invalid addresses and external image URLs fail',()=>{
 const {data,fields}=content('settings');
 for(const bad of ['javascript:alert(1)','//attacker.example','data:text/html,test','/../secret']){
  const d=structuredClone(data);d.nav[0].href=bad;assert.ok(validate(d,fields,'settings').length,bad);
 }
 for(const [key,value] of [['contactEmail','invalid'],['whatsappNumber','1234']]){const d=structuredClone(data);d[key]=value;assert.ok(validate(d,fields,'settings').length);}
 const p=content('products');p.data.products[0].image='https://unapproved.example/image.jpg';assert.ok(validate(p.data,p.fields,'products').length);
});
test('hero supports one, two and three valid media; rejects empty list, wrong types, missing cover and invalid duration',()=>{
 const {data,fields}=content('homepage');
 for(const count of [1,2,3]){const d=structuredClone(data);d.hero.media=d.hero.media.slice(0,count);assert.deepEqual(validate(d,fields,'homepage'),[]);}
 for(const mutate of [d=>d.hero.media=[],d=>d.hero.media[0].duration='6500',d=>d.hero.media[0].duration=1,d=>d.hero.media[0].duration=999999,d=>d.hero.media[0].poster='',d=>d.hero.media[0].type='image']){const d=structuredClone(data);mutate(d);assert.ok(validate(d,fields,'homepage').length);}
});
test('empty social/download lists are valid and duplicate case IDs are rejected',()=>{
 const s=content('settings');s.data.socialLinks=[];assert.deepEqual(validate(s.data,s.fields,'settings'),[]);
 const p=content('products');for(const x of p.data.products)x.downloads=[];assert.deepEqual(validate(p.data,p.fields,'products'),[]);
 const c=content('cases');c.data.cases.push(c.data.cases[0]);assert.ok(validate(c.data,c.fields,'cases').length);
});
test('production never enables local editing, including a localhost URL',()=>{
 assert.equal(auth.localEditingAllowed(new URL('http://localhost:3000'),{NODE_ENV:'production'}),false);
 assert.equal(auth.localEditingAllowed(new URL('http://localhost:3000'),{NODE_ENV:'development'}),true);
 assert.equal(auth.localEditingAllowed(new URL('https://evil.test'),{NODE_ENV:'development'}),false);
 assert.equal(auth.adminSettings({}).ready,false);
 assert.equal(auth.adminSettings(env).ready,true);
 for(const origin of ['http://nexbodyfit.com','https://nexbodyfit.com/path','https://user:pass@nexbodyfit.com','not-url'])assert.equal(auth.adminSettings({...env,CMS_SITE_URL:origin}).ready,false);
});
test('OAuth start rejects unconfigured requests and issues secure bounded state when configured',async()=>{
 const handler=environment=>load('src/app/api/admin/auth/route.ts',{'next/server':{NextResponse:FakeResponse},'@/lib/admin-auth':{...auth,adminSettings:()=>auth.adminSettings(environment)}}).GET;
 assert.equal((await handler({})(request('https://nexbodyfit.com/api/admin/auth'))).status,503);
 const res=await handler(env)(request('https://nexbodyfit.com/api/admin/auth'));
 const url=new URL(res.headers.get('location'));assert.equal(url.hostname,'github.com');assert.equal(url.searchParams.get('redirect_uri'),'https://nexbodyfit.com/api/admin/callback');
 const [name,state,opts]=res.cookies.values[0];assert.equal(name,auth.STATE_COOKIE);assert.match(state,/^[a-f0-9]{64}$/);assert.equal(opts.httpOnly,true);assert.equal(opts.secure,true);assert.equal(opts.sameSite,'lax');assert.equal(opts.maxAge,600);
});
test('OAuth missing or incorrect state and wrong origin never exchange a token',async()=>{
 let calls=0;const get=callback(async()=>{calls++;throw Error('should not run');});
 for(const req of [request('https://nexbodyfit.com/api/admin/callback?code=test'),request('https://nexbodyfit.com/api/admin/callback?code=test&state='+ 'b'.repeat(64),'a'.repeat(64)),request('https://evil.test/api/admin/callback?code=test&state='+ 'a'.repeat(64),'a'.repeat(64))])assert.ok((await get(req)).status>=400);
 assert.equal(calls,0);
});
test('OAuth returns token only after checking repository push permission, and clears state',async()=>{
 const calls=[];const get=callback(async(url,options)=>{calls.push({url,options});return Response.json(calls.length===1?{access_token:'test-token'}:{permissions:{push:true}});});
 const res=await get(request('https://nexbodyfit.com/api/admin/callback?code=test&state='+ 'a'.repeat(64),'a'.repeat(64)));
 assert.equal(res.status,200);assert.equal(calls.length,2);assert.equal(calls[1].url,'https://api.github.com/repos/CodeMan2834/nextbody-independentstation');assert.equal(calls[1].options.headers.Authorization,'Bearer test-token');
 const html=await res.text();assert.ok(html.includes('test-token'));assert.ok(html.includes('event.origin!==origin'));assert.equal(res.cookies.values[0][2].maxAge,0);assert.equal(res.headers.get('cache-control'),'no-store');assert.ok(res.headers.get('content-security-policy').includes('nonce-'));
});
test('OAuth denies repository read-only users, provider rejection and network errors without leaking tokens',async()=>{
 for(const outcome of ['readonly','rejected','network']){
  let count=0;const get=callback(async()=>{count++;if(outcome==='network')throw Error('private network error');if(outcome==='rejected')return Response.json({error:'bad_verification_code'});return Response.json(count===1?{access_token:'sensitive-token'}:{permissions:{push:false}});});
  const res=await get(request('https://nexbodyfit.com/api/admin/callback?code=test&state='+ 'a'.repeat(64),'a'.repeat(64)));
  assert.ok(res.status>=400);const html=await res.text();assert.ok(!html.includes('sensitive-token'));assert.ok(!html.includes('private network error'));
 }
});
test('runtime response omits secrets and production fallback cannot point to localhost',async()=>{
 const get=environment=>load('src/app/api/admin/runtime/route.ts',{'next/server':{NextResponse:FakeResponse},'@/lib/admin-auth':{...auth,adminSettings:()=>auth.adminSettings(environment),localEditingAllowed:u=>auth.localEditingAllowed(u,environment)}},{process:{env:environment}}).GET;
 for(const e of [{NODE_ENV:'production'},env]){
  const res=await get(e)(request('https://nexbodyfit.com/api/admin/runtime'));const body=await res.text();assert.ok(!body.includes('test-secret'));assert.ok(!body.includes('localhost:'));const json=JSON.parse(body);assert.equal(json.enabled,e===env);assert.equal(json.mode,'github');
 }
});

test('publish completion prevents stale editing until content is reloaded',async()=>{
 const elements=new Map();const handlers={};let reloads=0;
 const element=id=>{if(!elements.has(id))elements.set(id,{hidden:false,open:false,listeners:{},addEventListener(name,fn){this.listeners[name]=fn;},showModal(){this.open=true;}});return elements.get(id);};
 const configCopy=structuredClone(config);
 const context={document:{getElementById:element,createElement:()=>({}),body:{appendChild:el=>el.onload()}},fetch:async path=>({ok:true,json:async()=>path.includes('runtime')?{enabled:true,mode:'github',message:'online',backend:{name:'github'}}:configCopy}),location:{origin:'https://nexbodyfit.com',reload:()=>reloads++},window:{NEXBODY_LOCALE:{}},CMS:{registerLocale(){},registerEventListener:e=>handlers[e.name]=e.handler,init(){}},NEXBODY_VALIDATION:{validate:()=>[]},setTimeout(){},localStorage:{},sessionStorage:{}};
 vm.runInNewContext(fs.readFileSync(new URL('public/admin/admin.js',root),'utf8'),context);
 await new Promise(resolve=>setImmediate(resolve));
 await element('enter').listeners.click();
 for(const name of ['postSave','postPublish']){assert.equal(typeof handlers[name],'function');handlers[name]();assert.equal(element('save-complete').open,true);assert.match(element('save-result').textContent,/GitHub/);}
 let prevented=false;element('save-complete').listeners.cancel({preventDefault(){prevented=true;}});assert.equal(prevented,true);
 element('reload-content').listeners.click();assert.equal(reloads,1);
});

test('malformed CMS lists report errors instead of crashing the editor',()=>{
 for(const name of ['settings','products','cases','homepage']){
  const {data,fields}=content(name);const key={settings:'socialLinks',products:'products',cases:'cases',homepage:'hero'}[name];
  for(const value of [null,{},[null]]){const d=structuredClone(data);d[key]=name==='homepage'?{...d.hero,media:value}:value;assert.doesNotThrow(()=>validate(d,fields,name));if(!(['settings','cases'].includes(name)&&value===null))assert.ok(validate(d,fields,name).length,name);}
 }
});
test('dead links, unknown anchors and encoded traversal are blocked before save',()=>{
 const {data,fields}=content('settings');
 for(const href of ['/missing-page','#missing-anchor','/#missing-anchor','/%2e%2e/secret','/%2fexternal.example/path','/%5cserver/path']){const d=structuredClone(data);d.nav[0].href=href;assert.ok(validate(d,fields,'settings').length,href);}
 const d=structuredClone(data);d.nav[0].href='/#applications';assert.deepEqual(validate(d,fields,'settings'),[]);
});
test('SEO fields can fall back but reject oversized search snippets',()=>{
 const {data,fields}=content('settings');const d=structuredClone(data);d.seo={title:'',description:''};assert.deepEqual(validate(d,fields,'settings'),[]);
 d.seo.title='x'.repeat(121);assert.ok(validate(d,fields,'settings').length);d.seo={title:'NEXBODY',description:'x'.repeat(401)};assert.ok(validate(d,fields,'settings').length);
});
test('product lookup cannot resolve inherited object properties',()=>{
 const productModule=load('src/lib/products.ts',{'../../content/products.json':{default:JSON.parse(fs.readFileSync(new URL('content/products.json',root)))},'../../content/cases.json':{default:JSON.parse(fs.readFileSync(new URL('content/cases.json',root)))}});
 for(const slug of ['toString','constructor','__proto__','hasOwnProperty'])assert.equal(productModule.PRODUCTS[slug],undefined);assert.equal(productModule.PRODUCT_LIST.length,3);
});
