/* NEXBODY CMS entry: no browser-side password gate. */
const statusNode = document.getElementById('status');
const enter = document.getElementById('enter');
const retry = document.getElementById('retry');
let runtime;
async function checkRuntime(){
  enter.disabled=true;retry.hidden=true;
  try{
    const response=await fetch('/api/admin/runtime',{cache:'no-store'});
    if(!response.ok)throw Error('后台服务未启动或部署版本不完整。请联系技术负责人。');
    runtime=await response.json();statusNode.textContent=runtime.message;
    enter.textContent=runtime.mode==='local'?'进入本地编辑':'进入 GitHub 登录';
    enter.disabled=!runtime.enabled;
    if(!runtime.enabled)retry.hidden=false;
  }catch(error){statusNode.textContent=error.message;enter.textContent='暂时无法进入';retry.hidden=false;}
}
function script(src){return new Promise((resolve,reject)=>{const el=document.createElement('script');el.src=src;el.onload=resolve;el.onerror=()=>reject(Error('管理组件加载失败，请刷新重试。'));document.body.appendChild(el);});}
function notify(text){const el=document.getElementById('notice');el.textContent=text;el.hidden=false;setTimeout(()=>el.hidden=true,12000);}
enter.addEventListener('click',async()=>{
  enter.disabled=true;
  try{
    const response=await fetch('/admin/config.yml',{cache:'no-store'});if(!response.ok)throw Error('后台字段配置加载失败');
    const config=await response.json();config.backend=runtime.backend;config.local_backend=false;config.load_config_file=false;
    config.display_url=location.origin;config.site_url=location.origin;
    await script('/admin/decap-cms.js');
    CMS.registerLocale('zh_Hans',window.NEXBODY_LOCALE);
    CMS.registerEventListener({name:'preSave',handler:({entry})=>{
      const collection=config.collections.find(c=>c.name===entry.get('collection'));
      const file=collection?.files.find(f=>f.name===entry.get('slug'))||collection?.files[0];
      if(!file)throw Error('无法识别内容栏目，请刷新后重试');
      const errors=NEXBODY_VALIDATION.validate(entry.get('data').toJS(),file.fields,collection.name);
      if(errors.length){notify(errors.slice(0,6).join('\n'));throw Error(errors.slice(0,6).join('；'));}
    }});
    CMS.registerEventListener({name:'postSave',handler:()=>notify(runtime.mode==='local'?'内容已保存到本机。请刷新本地前台检查；线上尚未更新。':'内容已提交。请等待部署成功并检查正式网站；保存成功不等于上线成功。')});
    CMS.init({config});
    document.getElementById('welcome').hidden=true;document.getElementById('admin-toolbar').hidden=false;
    document.getElementById('mode-label').textContent=runtime.message;
  }catch(error){statusNode.textContent=error.message;retry.hidden=false;}
});
retry.addEventListener('click',()=>location.reload());
document.getElementById('logout').addEventListener('click',()=>{
  // Decap persists its own OAuth session. Clear only CMS keys, not unrelated site data.
  for(const store of [localStorage,sessionStorage])for(const key of Object.keys(store))if(/netlify-cms|decap-cms|nexbody-admin/i.test(key))store.removeItem(key);
  location.replace('/admin/index.html');
});
checkRuntime();
