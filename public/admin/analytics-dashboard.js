(()=>{
 const $=id=>document.getElementById(id),fmt=n=>Number(n||0).toLocaleString('zh-CN');
 const titles={overview:'运营总览',channels:'渠道来源',pages:'内容表现',modules:'模块交互',funnel:'询盘概况',campaign:'推广链接',health:'流量与网站健康'};
 const actions={navigate:'站内导航',consultation:'咨询入口',download:'资料下载',video_play:'主动播放视频',email:'联系邮箱',social:'社媒链接',external:'外部链接'};
 const channels={search:'自然搜索',social:'社交媒体',campaign:'推广活动',referral:'外部推荐',direct:'直接 / 未知'};
 let data=null,view='overview',demo=false,requestId=0;
 const day=(ago=0)=>new Date(Date.now()+8*3600000-ago*86400000).toISOString().slice(0,10);
 $('from').value=day(6);$('to').value=day();$('from').max=day();$('to').max=day();
 function el(tag,text,cls){const node=document.createElement(tag);if(text!==undefined)node.textContent=text;if(cls)node.className=cls;return node;}
 function table(id,headers,rows){const root=$(id);root.replaceChildren();if(!rows.length){root.append(el('p','当前范围暂无记录。','empty'));return;}
  const wrapper=el('div',undefined,'table-scroll'),t=el('table'),head=el('thead'),tr=el('tr');headers.forEach(h=>tr.append(el('th',h)));head.append(tr);t.append(head);const body=el('tbody');
  for(const cells of rows){const row=el('tr');for(const cell of cells)row.append(el('td',String(cell??'')));body.append(row);}t.append(body);wrapper.append(t);root.append(wrapper);
 }
 function state(type,title,message){$('connection').dataset.state=type;$('connection-title').textContent=title;$('connection-message').textContent=message;}
 function reset(){data=null;$('export').disabled=true;document.querySelectorAll('[data-metric]').forEach(n=>n.textContent='—');document.querySelectorAll('[data-change]').forEach(n=>n.textContent='等待真实数据');for(const id of ['chart','source-bars','top-pages','channels-table','pages-table','modules-table','actions-table','funnel'])$(id).replaceChildren(el('p','当前没有可展示的真实数据。','empty'));$('updated').textContent='北京时间 · 尚未加载统计';}
 function render(){
  if(!data)return;const totals=data.totals;
  for(const key of ['pageviews','clicks','consultations','inquiries']){
   document.querySelector(`[data-metric="${key}"]`).textContent=fmt(totals[key]);const previous=Number(data.previous?.[key]||0),current=Number(totals[key]||0);
   document.querySelector(`[data-change="${key}"]`).textContent=previous?`较上期 ${current>=previous?'+':''}${((current-previous)/previous*100).toFixed(1)}%`:(current?'上期无记录':'当前范围无记录');
  }
  $('updated').textContent=(demo?'演示数据 · ':'')+'北京时间 · 更新于 '+new Date(data.updatedAt).toLocaleString('zh-CN',{timeZone:'Asia/Shanghai',hour12:false});$('export').disabled=false;
  const rows=data.pages.map(p=>[p.path,fmt(p.pageviews)]);table('pages-table',['页面','浏览次数'],rows);table('top-pages',['页面','浏览次数'],rows.slice(0,5));
  table('channels-table',['渠道','来源','活动','浏览次数','点击次数'],data.channels.map(c=>[channels[c.channel]||c.channel,c.source,c.campaign||'—',fmt(c.pageviews),fmt(c.clicks)]));
  table('modules-table',['页面','模块','曝光次数','点击次数'],data.modules.map(m=>[m.path,data.labels.modules[m.module]||m.module,fmt(m.exposures),fmt(m.clicks)]));
  table('actions-table',['页面','模块','操作','点击次数'],data.actions.map(a=>[a.path,data.labels.modules[a.module]||a.module,actions[a.action]||a.action,fmt(a.clicks)]));
  const groups={};data.channels.forEach(c=>groups[c.channel]=(groups[c.channel]||0)+Number(c.pageviews));const max=Math.max(...Object.values(groups),1),bars=$('source-bars');bars.replaceChildren();
  for(const [name,value] of Object.entries(groups).sort((a,b)=>b[1]-a[1])){const row=el('div',undefined,'source-row'),label=el('div'),track=el('div',undefined,'source-track'),bar=el('i');label.append(el('span',channels[name]||name),el('strong',fmt(value)));bar.style.width=(value/max*100)+'%';track.append(bar);row.append(label,track);bars.append(row);}if(!data.channels.length)bars.append(el('p','暂无渠道记录。','empty'));
  table('funnel',['独立指标（非转化漏斗）','次数'],[['产品页浏览',fmt(data.funnel.product)],['联系页浏览',fmt(data.funnel.contact)],['成功提交询盘',fmt(data.funnel.success)]]);
  drawChart();
 }
 function drawChart(){
  const root=$('chart');root.replaceChildren();const values=[];for(let t=Date.parse(data.range.from);t<=Date.parse(data.range.to);t+=86400000){const date=new Date(t).toISOString().slice(0,10);const entry=data.trend.find(x=>x.day===date);values.push({day:date,pageviews:Number(entry?.pageviews||0)});}
  if(!values.length)return;const ns='http://www.w3.org/2000/svg',svg=document.createElementNS(ns,'svg');svg.setAttribute('viewBox','0 0 650 230');svg.setAttribute('role','img');svg.setAttribute('aria-label','所选日期页面浏览趋势');const max=Math.max(3,Math.ceil(Math.max(...values.map(x=>x.pageviews),1)/3)*3);
  function shape(tag,attrs){const n=document.createElementNS(ns,tag);for(const [k,v] of Object.entries(attrs))n.setAttribute(k,String(v));svg.append(n);return n;}
  for(let i=0;i<=3;i++){const y=15+i*56;shape('line',{x1:35,y1:y,x2:635,y2:y,stroke:'#e8eef5'});shape('text',{x:0,y:y+4}).textContent=Math.round(max*(1-i/3));}
  const points=values.map((v,i)=>[35+i/Math.max(values.length-1,1)*600,183-v.pageviews/max*168]);
  shape('polygon',{points:[...points,[points.at(-1)[0],183],[35,183]].map(x=>x.join(',')).join(' '),fill:'#edf3fd'});
  shape('polyline',{points:points.map(x=>x.join(',')).join(' '),fill:'none',stroke:'#2f69c8','stroke-width':2.5});
  if(values.length<=31)points.forEach((point,index)=>{const circle=shape('circle',{cx:point[0],cy:point[1],r:3,fill:'#2f69c8'});const title=document.createElementNS(ns,'title');title.textContent=values[index].day+'：'+values[index].pageviews+' 次浏览';circle.append(title);});
  const tickIndices=[...new Set([0,Math.floor((values.length-1)/2),values.length-1])];for(const i of tickIndices)shape('text',{x:points[i][0],y:215,'text-anchor':i===0?'start':i===values.length-1?'end':'middle'}).textContent=values[i].day.slice(5);
  root.append(svg);
 }
 function params(){return new URLSearchParams({from:$('from').value,to:$('to').value,channel:$('channel').value,device:$('device').value,product:$('product').value});}
 async function load(){const id=++requestId;$('refresh').disabled=true;if(!demo)state('loading','正在读取','按所选条件汇总访问记录。');try{
  if(demo){$('login').hidden=true;data=demoData();state('demo','演示数据 · 非真实访问','用于预览布局与操作；不会写入数据库，筛选不代表真实业务结果。');render();return;}
  const response=await fetch('/api/analytics/report?'+params(),{cache:'no-store',signal:AbortSignal.timeout(20000)});const result=await response.json();if(id!==requestId)return;
  $('login').hidden=result.state!=='unauthorised'||!result.loginReady;
  if(result.state==='ready'){data=result.data;state('ready',result.local?'本地验收 · 非线上统计':'统计已连接',result.local?'仅展示本机测试数据库的数据，不代表正式网站访问。':'无访客标识的事件汇总；不统计人数或会话。成功提交不等同于实际收件。');render();}
  else{reset();state(result.state,(result.state==='unconfigured'||(result.state==='unauthorised'&&!result.loginReady))?'等待数据库接入':result.state==='unauthorised'?'需要登录':'暂时无法读取',result.message);}
 }catch{if(id===requestId){reset();state('error','暂时无法读取','请检查网络后重试。此状态不代表访问量为零。');}}finally{if(id===requestId)$('refresh').disabled=false;}}
 function demoData(){
  const days=Math.max(1,Math.min(366,Math.floor((Date.parse($('to').value)-Date.parse($('from').value))/86400000)+1));const trend=Array.from({length:days},(_,i)=>({day:new Date(Date.parse($('from').value)+i*86400000).toISOString().slice(0,10),pageviews:[72,84,65,110,98,136,129][i%7]}));
  return {mode:'aggregate',range:{from:$('from').value,to:$('to').value},updatedAt:new Date().toISOString(),totals:{pageviews:694,clicks:170,consultations:38,inquiries:7},previous:{pageviews:612,clicks:145,consultations:30,inquiries:5},trend,channels:[{channel:'search',source:'google.com',campaign:'',pageviews:283,clicks:69},{channel:'campaign',source:'exhibition',campaign:'demo_expo',pageviews:221,clicks:54},{channel:'social',source:'instagram.com',campaign:'',pageviews:120,clicks:31},{channel:'direct',source:'direct',campaign:'',pageviews:70,clicks:16}],pages:[{path:'/products/nexbody-x60',pageviews:210},{path:'/',pageviews:195},{path:'/products/f20-foot-scanner',pageviews:121},{path:'/solutions',pageviews:94},{path:'/contact',pageviews:74}],modules:[{path:'/',module:'products',exposures:168,clicks:91},{path:'/',module:'navigation',exposures:245,clicks:120},{path:'/',module:'consultation',exposures:80,clicks:23}],actions:[{path:'/',module:'navigation',action:'navigate',clicks:120},{path:'/',module:'consultation',action:'consultation',clicks:23}],funnel:{product:331,contact:74,success:7},labels:{modules:{products:'首页产品展示',navigation:'顶部导航',consultation:'首页咨询'}}};
 }
 function selectView(next){view=next;const health=view==='health';document.querySelector('.subtitle').textContent=health?'覆盖请求、流量、缓存与响应状态。':'从访问来源，到下一次有效咨询。';$('connection').hidden=health;$('business-source').hidden=health;document.querySelector('.footnote').hidden=health;if(health)window.NexbodyHealth.activate(demo);else window.NexbodyHealth.deactivate();$('filters').hidden=view==='campaign'||health;document.querySelector('.quick-range').hidden=view==='campaign'||health;document.querySelector('.metrics').hidden=view==='campaign'||health;document.querySelectorAll('[data-view]').forEach(button=>{if(button.dataset.view===view)button.setAttribute('aria-current','page');else button.removeAttribute('aria-current');});document.querySelectorAll('[data-panel]').forEach(panel=>panel.hidden=panel.dataset.panel!==view);$('view-title').textContent=titles[view];$('export').disabled=!data||view==='campaign';}
 document.querySelectorAll('[data-view]').forEach(button=>button.addEventListener('click',()=>selectView(button.dataset.view)));
 $('filters').addEventListener('submit',e=>{e.preventDefault();if($('from').value>$('to').value){state('error','日期范围无效','开始日期不能晚于结束日期。');return;}load();});
 document.querySelectorAll('[data-days]').forEach(button=>button.addEventListener('click',()=>{$('from').value=day(Number(button.dataset.days)-1);$('to').value=day();load();}));
 $('demo').hidden=false;$('demo').addEventListener('click',()=>{demo=!demo;$('demo').textContent=demo?'返回连接状态':'查看演示数据';if(view==='health')window.NexbodyHealth.activate(demo);load();});
 if(new URLSearchParams(location.search).get('demo')==='1'){demo=true;$('demo').textContent='返回连接状态';}
 $('logout').addEventListener('click',async()=>{try{await fetch('/api/admin/analytics-logout',{method:'POST'});}finally{location.replace('/admin/analytics.html');}});
 $('campaign-form').addEventListener('submit',e=>{e.preventDefault();const url=new URL($('campaign-path').value,'https://nexbodyfit.com');for(const [field,key] of [['campaign-source','utm_source'],['campaign-medium','utm_medium'],['campaign-name','utm_campaign']])url.searchParams.set(key,$(field).value.trim().toLowerCase());$('campaign-result').value=url.toString();$('campaign-status').textContent='链接已生成，可用于二维码、邮件或社媒推广。';});
 $('copy-link').addEventListener('click',async()=>{if(!$('campaign-result').value)return;try{await navigator.clipboard.writeText($('campaign-result').value);$('campaign-status').textContent='已复制。';}catch{$('campaign-result').select();$('campaign-status').textContent='请手动复制已选中的链接。';}});
 $('export').addEventListener('click',()=>{if(!data)return;const fields={overview:['pageviews','clicks','consultations','inquiries'],channels:['channel','source','campaign','pageviews','clicks'],pages:['path','pageviews'],modules:['path','module','exposures','clicks'],funnel:['product','contact','success']};const keys=fields[view]||fields.overview;const rows=view==='overview'?[data.totals]:view==='funnel'?[data.funnel]:data[view];const cell=v=>'"'+String(v??'').replace(/^[=+@-]/,"'$&").replaceAll('"','""')+'"';const labels={channel:'渠道',source:'来源',campaign:'活动',pageviews:'页面浏览',consultations:'咨询入口点击',inquiries:'成功提交询盘',path:'页面',module:'模块',exposures:'曝光次数',clicks:'点击次数',total_clicks:'点击次数',entered:'进入网站',product:'产品页浏览',contact:'联系页浏览',success:'成功提交询盘'};const csv='\uFEFF'+[keys.map(key=>labels[key]||key),...rows.map(row=>keys.map(key=>key==='module'?(data.labels.modules[row[key]]||row[key]):key==='channel'?(channels[row[key]]||row[key]):row[key]))].map(row=>row.map(cell).join(',')).join('\r\n');const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));const link=el('a');link.href=url;link.download=`NEXBODY-${demo?'DEMO-':''}${view}-${$('from').value}.csv`;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});
 if(new URLSearchParams(location.search).get('login')==='denied')state('error','登录未完成','请确认 GitHub 仓库写权限后重新登录。');
 setInterval(()=>{if(document.visibilityState==='visible'&&!demo&&data&&view!=='campaign'&&view!=='health')load();},300000);
 load();
 if(new URLSearchParams(location.search).get('view')==='health')selectView('health');
})();
