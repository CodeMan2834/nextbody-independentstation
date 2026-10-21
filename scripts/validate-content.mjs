import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {validate}=require('../public/admin/validation.js');
const config=JSON.parse(fs.readFileSync('public/admin/config.yml','utf8'));
let errors=[];
const routes=new Set(['/','/products','/contact','/success','/privacy','/terms',...JSON.parse(fs.readFileSync('content/products.json','utf8')).products.map(p=>'/products/'+p.slug)]);
for(const route of ['/about','/solutions','/blog',...JSON.parse(fs.readFileSync('content/editorial.json','utf8')).solutions.map(item=>'/solutions/'+item.slug)])routes.add(route);
const editorial=JSON.parse(fs.readFileSync('content/editorial.json','utf8'));
for(const post of editorial.posts)if(post.status==='published')routes.add('/blog/'+post.slug);
const homeAnchors=new Set(['workflow','products','applications','consultation','main-content','home-title','value-pillars-title','intelligence-title','case-title','industry-title','service-title','faq-title']);
for(const c of config.collections)for(const file of c.files){
 const data=JSON.parse(fs.readFileSync(file.file,'utf8'));
 errors.push(...validate(data,file.fields,c.name).map(x=>file.file+' / '+x));
 function assets(value,key=''){
  if(typeof value==='string'&&value.startsWith('/')&&(/\.[a-z0-9]{2,6}(?:[?#]|$)/i.test(value)||['src','image','heroImage','workflowImage','video','poster'].includes(key))){
   const pathname=value.split(/[?#]/)[0];
   if(!fs.existsSync(path.join('public',pathname)))errors.push(file.file+'：资源不存在 '+value);
  }else if(typeof value==='string'&&/href$/i.test(key)&&value.startsWith('/')){
   const url=new URL(value,'https://nexbodyfit.com');
   if(!routes.has(url.pathname))errors.push(file.file+'：站内页面不存在 '+value);
   if(url.pathname==='/'&&url.hash&&!homeAnchors.has(url.hash.slice(1)))errors.push(file.file+'：首页锚点不存在 '+value);
  }else if(Array.isArray(value))value.forEach(assets);
  else if(value&&typeof value==='object')Object.entries(value).forEach(([k,v])=>assets(v,k));
 }
 assets(data);
}
if(errors.length){console.error(errors.join('\n'));process.exitCode=1;}
else console.log('Content validation passed: all configured collections, media paths and protected product identifiers.');
