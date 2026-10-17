import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.PLAYWRIGHT_MODULE_PATH || 'playwright');
const base=process.env.CMS_TEST_URL || 'http://127.0.0.1:3097';
assert.ok(['127.0.0.1','localhost'].includes(new URL(base).hostname),'Only run against a local test server');
const root=process.env.CMS_TEST_PROJECT_ROOT || path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const out=path.resolve(process.env.CMS_TEST_OUTPUT || path.join(root,'test-results/admin'));
fs.mkdirSync(out,{recursive:true});
const config=JSON.parse(fs.readFileSync(path.join(root,'public/admin/config.yml'),'utf8'));
const originals=new Map(config.collections.flatMap(c=>c.files).map(f=>[f.file,fs.readFileSync(path.join(root,f.file))]));
const parse=file=>JSON.parse(originals.get(file));
const results=[],errors=[],failures=[],validationSignals=[];let checkingInvalidInput=false;
function record(name,details={}){results.push({name,status:'passed',...details});console.log('PASS',name);}
const runtime=await(await fetch(base+'/api/admin/runtime')).json();
assert.equal(runtime.mode,'local');assert.equal(runtime.enabled,true);
const proxy=runtime.backend.proxy_url;
assert.ok(['127.0.0.1','localhost'].includes(new URL(proxy).hostname));
async function api(action,params={}){
 const response=await fetch(proxy,{method:'POST',headers:{'Content-Type':'application/json',Origin:base},body:JSON.stringify({action,params:{branch:'main',...params}})});
 const data=await response.json();assert.equal(response.status,200,JSON.stringify(data));return data;
}
async function persist(file,data){
 await api('persistEntry',{entry:{slug:path.basename(file,'.json'),path:file,raw:JSON.stringify(data,null,2)+'\n'},assets:[],options:{collectionName:'audit',commitMessage:'Local CMS audit',useWorkflow:false,status:'published'}});
 const actual=await api('getEntry',{path:file});assert.deepEqual(JSON.parse(actual.data),data);await new Promise(resolve=>setTimeout(resolve,1200));
}
const browser=await chromium.launch({headless:true,channel:process.env.PLAYWRIGHT_CHANNEL || 'msedge'});
const context=await browser.newContext({viewport:{width:1440,height:1000}});
const page=await context.newPage();
page.on('pageerror',e=>{if(checkingInvalidInput&&['Object','undefined',undefined].includes(e.message))validationSignals.push({message:String(e.message),context:'Decap rejected invalid field'});else errors.push(e.message||String(e));});
page.on('response',r=>{if(r.status()>=400&&!r.url().includes('/api/admin/auth'))failures.push({url:r.url(),status:r.status()});});
const marker='NEXBODY CMS Audit 20261017';
const upload='public/images/uploads/cms-audit-20261017.png';
const existed=fs.existsSync(path.join(root,upload));
assert.equal(existed,false,'Audit upload filename must not already exist');
let editorVisit=0;
async function openEditor(collection,slug,selector){
 await page.goto(`${base}/admin/index.html?audit=${++editorVisit}#/collections/${collection}/entries/${slug}`,{waitUntil:'domcontentloaded'});
 await page.getByRole('button',{name:'进入本地编辑',exact:true}).click();
 await Promise.race([page.getByRole('button',{name:'登录',exact:true}).waitFor({state:'visible',timeout:30000}).then(()=>page.getByRole('button',{name:'登录',exact:true}).click()),page.locator(selector).first().waitFor({state:'attached',timeout:30000})]);
 await page.locator(selector).first().waitFor({state:'attached',timeout:15000});
 assert.ok(!(await page.locator('body').innerText()).includes('Failed to load entry'));
}
async function front(route,values){
 for(let attempt=0;attempt<6;attempt++){
  await page.goto(base+route,{waitUntil:'domcontentloaded',timeout:90000});
  const text=await page.locator('body').innerText();
  if(values.every(value=>text.includes(value)))return;
  if(attempt===5)throw Error('Frontend did not reflect saved values: '+values.filter(value=>!text.includes(value)).join(', '));
  await page.waitForTimeout(1200);
 }

}
try{
 // Verify real CMS forms, not merely configuration parsing.
 for(const [collection,slug,selector] of [['settings','site-settings','input[id^="tagline-field"]'],['products','products','input[id^="name-field"]'],['cases','cases','input[id^="id-field"]'],['homepage','homepage-experience','input[id^="overline-field"]'],['pages','pages','input[id^="title-field"]']]){
  await openEditor(collection,slug,selector);record('CMS form loads: '+collection);
 }
 // Actual user-facing save controls, validation rejection, disk readback and frontend.
 await openEditor('settings','site-settings','input[id^="tagline-field"]');
 checkingInvalidInput=true;await page.locator('input[id^="contactEmail-field"]').fill('invalid-email');
 await page.locator('input[id^="tagline-field"]').click();
 await page.waitForTimeout(500);
 if(!await page.getByText(/联系邮箱：格式不正确/).first().isVisible()){
  await page.getByRole('button',{name:'发布',exact:true}).click();
  await page.getByText('立即发布',{exact:true}).click();
 }
 await page.getByText(/联系邮箱：格式不正确/).first().waitFor();
 assert.equal(JSON.parse(fs.readFileSync(path.join(root,'content/site-settings.json'))).contactEmail,parse('content/site-settings.json').contactEmail);
 record('Invalid CMS email blocked before persistence');
 await page.locator('input[id^="contactEmail-field"]').fill('');await page.waitForTimeout(400);await page.locator('input[id^="contactEmail-field"]').fill(parse('content/site-settings.json').contactEmail);await page.waitForTimeout(400);
 checkingInvalidInput=false;await page.locator('input[id^="tagline-field"]').fill(marker+' footer');
 await page.getByRole('button',{name:'发布',exact:true}).click();
 await page.getByText('立即发布',{exact:true}).click();
 await page.getByText('修改已保存',{exact:true}).waitFor();
 assert.equal(JSON.parse(fs.readFileSync(path.join(root,'content/site-settings.json'))).tagline,marker+' footer');assert.equal(JSON.parse(fs.readFileSync(path.join(root,'content/site-settings.json'))).contactEmail,parse('content/site-settings.json').contactEmail);
 await page.screenshot({path:path.join(out,'cms-saved.png'),fullPage:false});
 await front('/',[marker+' footer']);record('CMS UI publish -> JSON persistence -> homepage display');

 // All mutable content sources round-trip through the actual local CMS proxy.
 const settings=parse('content/site-settings.json');
 settings.tagline=marker+' footer';settings.nav[0].label=marker+' nav';settings.headerCta.label=marker+' header CTA';
 settings.socialLinks=[{label:marker+' social',href:'https://example.com/official-account'}];
 await persist('content/site-settings.json',settings);
 await front('/',[marker+' footer',marker+' nav',marker+' header CTA',marker+' social']);record('Site navigation, header CTA, footer and social links update');

 const home=parse('content/homepage.json');
 const homeValues=[];
 for(const key of ['hero','valuePillars','workflow','assessment','fieldFilm','ecosystem','cases','industries','service','faq','cta','finalCta']){
  home[key].title=marker+' home '+key;homeValues.push(home[key].title);
 }
 home.assessment.intro=marker+' assessment intro';homeValues.push(home.assessment.intro);
 await persist('content/homepage.json',home);await front('/',homeValues);record('All 12 homepage content regions update');

 const products=parse('content/products.json');
 const pixel='iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aSioAAAAASUVORK5CYII=';
 await api('persistMedia',{asset:{path:upload,content:pixel,encoding:'base64'},options:{commitMessage:'Local audit upload'}});
 const media=await api('getMediaFile',{path:upload});assert.equal(media.encoding,'base64');
 assert.equal((await fetch(base+'/images/uploads/cms-audit-20261017.png')).status,200);record('Media upload -> proxy readback -> public asset');
 for(const [i,product] of products.products.entries()){
  product.summary=marker+' summary '+i;product.tagline=marker+' tagline '+i;product.story.title=marker+' story '+i;
  product.downloads=[{label:marker+' download '+i,href:'/images/uploads/cms-audit-20261017.png'}];
 }
 await persist('content/products.json',products);
 for(const product of products.products){
  await front('/products/'+product.slug,[product.summary,product.tagline,product.story.title,product.downloads[0].label]);
  assert.equal(await page.getByRole('link',{name:product.downloads[0].label+' ↗'}).getAttribute('href'),product.downloads[0].href);
 }
 await front('/products',products.products.map(p=>p.summary));record('All three product details, directory, taglines, stories and downloads update');

 const cases=parse('content/cases.json');
 const extra=structuredClone(cases.cases[0]);extra.id='cms-audit-extra';extra.headline=marker+' fifth case';cases.cases.push(extra);
 await persist('content/cases.json',cases);await front('/',[extra.headline]);record('Fifth case is displayed (previous fixed four-case truncation removed)');

 const pages=parse('content/pages.json');
 for(const key of Object.keys(pages))pages[key].title=marker+' page '+key;
 await persist('content/pages.json',pages);
 for(const key of Object.keys(pages))await front('/'+key,[pages[key].title]);record('Independent pages: products, contact, success, privacy, terms update');

 // Restore all content before testing baseline layout and carousel variants.
 for(const [file,bytes] of originals)fs.writeFileSync(path.join(root,file),bytes);
 await front('/',[parse('content/homepage.json').hero.title]);
 const firstImage={type:'image',src:'/media/products/x60/x60-gym.png',alt:'Local audit image',duration:3000};
 for(const count of [1,2,3]){
  const d=parse('content/homepage.json');d.hero.media=Array.from({length:count},(_,i)=>({...firstImage,src:i===1?'/media/products/x60/x60-analysis.png':i===2?'/media/products/x60/x60-device.png':firstImage.src,alt:'Audit media '+i}));
  await persist('content/homepage.json',d);await page.goto(base+'/',{waitUntil:'load',timeout:90000});
  const controls=page.locator('.cinematic-hero-pagination button');assert.equal(await controls.count(),count===1?0:count);
  assert.equal(await page.locator('.cinematic-hero-slide').count(),count);
  if(count>1){await controls.last().click();await page.waitForFunction(()=>document.querySelector('.cinematic-hero-pagination button:last-child')?.getAttribute('aria-current')==='true',{},{timeout:2500});assert.equal(await controls.last().getAttribute('aria-current'),'true');}
  assert.equal(await page.locator('.cinematic-hero-slide.is-active .cinematic-hero-image').first().evaluate(el=>getComputedStyle(el).animationName)!=='none',true);
 }
 record('One/two/three image carousel, manual switching and image zoom');
 for(const [file,bytes] of originals)fs.writeFileSync(path.join(root,file),bytes);

 for(const [name,width,height] of [['desktop',1440,1000],['tablet',768,1024],['mobile',390,844]]){
  await page.setViewportSize({width,height});await page.goto(base+'/',{waitUntil:'domcontentloaded'});
  const metrics=await page.evaluate(()=>({viewport:innerWidth,page:document.documentElement.scrollWidth}));assert.ok(metrics.page<=metrics.viewport+1,JSON.stringify(metrics));
  await page.screenshot({path:path.join(out,'homepage-'+name+'.png'),fullPage:false});
  if(name==='mobile'){await page.getByRole('button',{name:'Open menu'}).click();await page.getByRole('link',{name:'Contact',exact:true}).first().waitFor({state:'visible'});}
  record('Homepage layout '+name+' '+width+'px');
 }
 await page.setViewportSize({width:1440,height:1000});
 for(const product of parse('content/products.json').products){await page.goto(base+'/products/'+product.slug,{waitUntil:'domcontentloaded'});await page.screenshot({path:path.join(out,product.slug+'.png'),fullPage:false});}
 await openEditor('settings','site-settings','input[id^="tagline-field"]');
 await page.getByRole('button',{name:'退出 / 结束编辑'}).click();await page.getByRole('button',{name:'进入本地编辑'}).waitFor();
 assert.equal(await page.evaluate(()=>localStorage.getItem('decap-cms-user')),null);record('Logout clears CMS stored identity');
 assert.deepEqual(errors,[],'Browser runtime errors: '+JSON.stringify(errors));
 assert.deepEqual(failures,[],'Failed network responses: '+JSON.stringify(failures));
 record('No browser runtime errors or failed HTTP resources in tested flows');
}catch(error){
 console.log('PAGE ON FAILURE',await page.locator('body').innerText());await page.screenshot({path:path.join(out,'failure.png'),fullPage:false});throw error;
}finally{
 for(const [file,bytes] of originals)fs.writeFileSync(path.join(root,file),bytes);
 if(fs.existsSync(path.join(root,upload)))await api('deleteFile',{path:upload,options:{commitMessage:'Remove local audit asset'}});
 await browser.close();
 const report={time:new Date().toISOString(),base,project:root,results,browserErrors:errors,expectedValidationSignals:validationSignals,httpFailures:failures,contentRestored:[...originals].every(([file,bytes])=>fs.readFileSync(path.join(root,file)).equals(bytes)),scope:'Local CMS and frontend integration. No real GitHub authorization, Vercel deployment or email transmission.'};
 fs.writeFileSync(path.join(out,'integration-results.json'),JSON.stringify(report,null,2));
 console.log('Report:',path.join(out,'integration-results.json'));
}
