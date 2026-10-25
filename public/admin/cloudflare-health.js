/* Independent Cloudflare view. No Cloudflare credential or event write is performed in the browser. */
(()=>{
 const $=id=>document.getElementById(id),number=v=>Math.round(Number(v||0)).toLocaleString('zh-CN');
 let active=false,demo=false,range='24h',data=null,sequence=0;
 const rangeLabels={'24h':'最近 24 小时','7d':'最近 7 天','30d':'最近 30 天'};
 const palette={success:'#348b91',redirect:'#7199ba',client:'#cf9c50',server:'#bc655d',other:'#99a7b6'};
 const cacheLabels={hit:'HIT · 缓存命中',miss:'MISS · 未命中',dynamic:'DYNAMIC · 动态请求',bypass:'BYPASS · 跳过缓存',expired:'EXPIRED · 缓存过期',revalidated:'REVALIDATED · 重新验证',stale:'STALE · 旧缓存',updating:'UPDATING · 更新中',none:'NONE · 未标记'};
 const percentage=v=>v===null||v===undefined?'—':Number(v).toFixed(2)+'%';
 function node(tag,text,cls){const e=document.createElement(tag);if(text!==undefined)e.textContent=text;if(cls)e.className=cls;return e;}
 function bytes(value){if(!value)return '0 B';const units=['B','KB','MB','GB','TB'],i=Math.min(4,Math.floor(Math.log(value)/Math.log(1000)));return (value/1000**i).toLocaleString('zh-CN',{maximumFractionDigits:i?2:0})+' '+units[i];}
 function time(value){return new Date(value).toLocaleString('zh-CN',{timeZone:'Asia/Shanghai',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hour12:false});}
 function state(type,title,message){$('health-state').dataset.state=type;$('health-state-title').textContent=title;$('health-state-message').textContent=message;}
 function empty(message){data=null;$('health-export').disabled=true;for(const id of ['requests','bytes','cache-rate','error-rate'])$('health-'+id).textContent='—';for(const id of ['chart','countries','cache','statuses'])$('health-'+id).replaceChildren(node('p',message,'empty'));$('health-response-strip').replaceChildren();$('health-window').textContent='所选范围：'+rangeLabels[range];$('health-fetched').textContent='尚无可展示的数据快照';$('health-sampling').textContent='自适应数据集，可能使用采样估算';}
 function ratio(value){return data?.totals.requests?value/data.totals.requests*100:null;}
 function country(code){try{return new Intl.DisplayNames(['zh-CN'],{type:'region'}).of(code)||code;}catch{return code==='XX'?'未知地区':code;}}
 function drawTrend(){
  const root=$('health-chart');root.replaceChildren();$('health-grain').textContent=data.grain==='hour'?'小时汇总 · 标签为北京时间':'按 UTC 日汇总';
  if(!data.trend.length){root.append(node('p','当前数据窗口暂无请求记录。','empty'));return;}
  const interval=data.grain==='hour'?3600000:86400000,start=Math.floor(Date.parse(data.window.start)/interval)*interval,end=Math.floor((Date.parse(data.window.end)-1)/interval)*interval;
  const values=[];for(let t=start;t<=end&&values.length<750;t+=interval){const matched=data.trend.find(r=>Date.parse(r.time)===t);values.push({time:t,value:Number(matched?.requests||0)});}
  if(!values.length){root.append(node('p','当前请求趋势暂不可展示。','empty'));return;}
  const ns='http://www.w3.org/2000/svg',svg=document.createElementNS(ns,'svg');svg.setAttribute('viewBox','0 0 720 240');svg.setAttribute('role','img');svg.setAttribute('aria-label',rangeLabels[range]+' Cloudflare 请求趋势');
  function shape(tag,attrs){const e=document.createElementNS(ns,tag);for(const [k,v]of Object.entries(attrs))e.setAttribute(k,String(v));svg.append(e);return e;}
  const max=Math.max(4,Math.ceil(Math.max(...values.map(r=>r.value))/4)*4);
  for(let i=0;i<5;i++){const y=14+i*43;shape('line',{x1:48,x2:706,y1:y,y2:y,stroke:'#e7edf3','stroke-dasharray':i===4?'':'3 5'});shape('text',{x:37,y:y+4,'text-anchor':'end'}).textContent=new Intl.NumberFormat('zh-CN',{notation:'compact',maximumFractionDigits:1}).format(max*(1-i/4));}
  const points=values.map((r,i)=>[48+i/Math.max(1,values.length-1)*658,186-r.value/max*172]);
  shape('polygon',{points:[[48,186],...points,[points.at(-1)[0],186]].map(p=>p.join(',')).join(' '),fill:'#e5f1f6'});
  shape('polyline',{points:points.map(p=>p.join(',')).join(' '),fill:'none',stroke:'#2587aa','stroke-width':2.5,'stroke-linejoin':'round'});
  points.forEach((p,i)=>{const circle=shape('circle',{cx:p[0],cy:p[1],r:3,fill:'#2587aa'}),title=document.createElementNS(ns,'title');title.textContent=(data.grain==='hour'?time(values[i].time):new Date(values[i].time).toISOString().slice(0,10)+' UTC')+'：'+number(values[i].value)+' 次请求';circle.append(title);});
  const ticks=[...new Set([0,Math.floor((values.length-1)/3),Math.floor((values.length-1)*2/3),values.length-1])];
  for(const i of ticks){const date=new Date(values[i].time),label=data.grain==='hour'?date.toLocaleString('zh-CN',{timeZone:'Asia/Shanghai',month:'2-digit',day:'2-digit',hour:'2-digit',hour12:false}):date.toISOString().slice(5,10);shape('text',{x:points[i][0],y:220,'text-anchor':i===0?'start':i===values.length-1?'end':'middle'}).textContent=label;}
  root.append(svg);
 }
 function breakdown(id,rows){const root=$(id);root.replaceChildren();if(!rows.length){root.append(node('p','当前数据窗口暂无记录。','empty'));return;}for(const r of rows){const row=node('div',undefined,'health-breakdown'),label=node('b'),dot=node('i',undefined,'health-code');dot.style.background=r.color;label.append(dot,document.createTextNode(r.label));row.append(label,node('strong',number(r.requests)),node('span',percentage(ratio(r.requests))));root.append(row);}}
 function render(){
  $('health-export').disabled=false;$('health-requests').textContent=number(data.totals.requests);$('health-bytes').textContent=bytes(data.totals.bytes);$('health-cache-rate').textContent=percentage(data.totals.cacheHitRate);$('health-error-rate').textContent=percentage(data.totals.serverErrorRate);
  $('health-window').textContent=rangeLabels[range]+' · '+time(data.window.start)+' — '+time(data.window.end)+'（北京时间）';
  $('health-fetched').textContent=(demo?'演示快照 · ':'最近读取 · ')+time(data.fetchedAt)+(data.cached?' · 使用缓存':'');
  $('health-sampling').textContent=demo?'演示数据，不代表实际网站访问':data.sampling==='sampled'?'Cloudflare 采样估算，数值可能近似':'自适应统计，可能采用采样估算';
  drawTrend();const root=$('health-countries');root.replaceChildren();if(!data.countries.length)root.append(node('p','当前数据窗口暂无地区记录。','empty'));
  data.countries.forEach((r,i)=>{const row=node('div',undefined,'health-country-row'),body=node('div'),label=node('div',undefined,'health-country-name'),track=node('div',undefined,'health-country-track'),bar=node('i');label.append(node('span',country(r.country)),node('small',percentage(ratio(r.requests))));bar.style.width=Math.min(100,Math.max(0,ratio(r.requests)||0))+'%';track.append(bar);body.append(label,track);row.append(node('span',String(i+1).padStart(2,'0'),'health-country-rank'),body,node('strong',number(r.requests),'health-country-total'));root.append(row);});
  breakdown('health-cache',data.cache.map(r=>({label:cacheLabels[r.status.toLowerCase()]||r.status,requests:r.requests,color:r.status.toLowerCase()==='hit'?'#348b91':'#8cabc3'})));
  const color=s=>s>=500?palette.server:s>=400?palette.client:s>=300?palette.redirect:s>=200?palette.success:palette.other;
  breakdown('health-statuses',data.statuses.map(r=>({label:String(r.status),requests:r.requests,color:color(r.status)})));
  const strip=$('health-response-strip');strip.replaceChildren();const groups=[['2xx',200,299],['3xx',300,399],['4xx',400,499],['5xx',500,599],['其他',0,199]];for(const [label,min,max]of groups){const count=data.statuses.filter(r=>r.status>=min&&r.status<=max).reduce((n,r)=>n+r.requests,0);if(!count)continue;const segment=node('i');segment.style.width=(ratio(count)||0)+'%';segment.style.background=color(min);segment.title=label+'：'+number(count);strip.append(segment);}
 }
 function demoData(){const end=Date.now(),days=range==='24h'?1:range==='7d'?7:30,start=end-days*86400000,step=range==='24h'?3600000:86400000,trend=[];for(let t=Math.floor(start/step)*step,i=0;t<end;t+=step,i++)trend.push({time:new Date(t).toISOString(),requests:[380,510,640,460,720,910,1120,840][i%8]*(range==='24h'?1:24)});const requests=trend.reduce((n,r)=>n+r.requests,0),hits=Math.floor(requests*.72),e5=Math.floor(requests*.003),e4=Math.floor(requests*.037),redirect=Math.floor(requests*.08),success=requests-e5-e4-redirect;return {source:'cloudflare',host:'nexbodyfit.com',range,window:{start:new Date(start).toISOString(),end:new Date(end).toISOString()},fetchedAt:new Date(end).toISOString(),grain:range==='24h'?'hour':'day',sampling:'adaptive',totals:{requests,bytes:requests*148000,cacheHitRate:hits/requests*100,serverErrorRate:e5/requests*100,clientErrors:e4,serverErrors:e5},trend,countries:[{country:'US',requests:Math.floor(requests*.32)},{country:'CN',requests:Math.floor(requests*.24)},{country:'AE',requests:Math.floor(requests*.15)},{country:'DE',requests:Math.floor(requests*.09)},{country:'GB',requests:Math.floor(requests*.07)}],cache:[{status:'hit',requests:hits},{status:'dynamic',requests:Math.floor(requests*.18)},{status:'miss',requests:requests-hits-Math.floor(requests*.18)}],statuses:[{status:200,requests:success},{status:301,requests:redirect},{status:404,requests:e4},{status:502,requests:e5}]};}
 async function load(){const id=++sequence;$('health-refresh').disabled=true;$('health-login').hidden=true;empty('正在读取 Cloudflare 汇总…');state('loading','正在读取 Cloudflare 数据','按所选时间范围读取，数据独立于 Turso 网站交互统计。');
  try{
   if(demo){data=demoData();state('demo','演示数据 · 非真实流量','仅预览图表、布局与操作，不请求 Cloudflare，也不写入数据库。');render();return;}
   const response=await fetch('/api/analytics/cloudflare?'+new URLSearchParams({range}),{cache:'no-store',signal:AbortSignal.timeout(30000)}),result=await response.json();if(id!==sequence||!active)return;
   if(result.state==='ready'&&response.ok){data={...result.data,cached:result.cached};state('ready',data.totals.requests?'Cloudflare 数据已连接':'Cloudflare 已连接 · 当前窗口暂无请求',data.partial?'部分状态明细达到返回上限，相关比例暂不展示。':'来源：Cloudflare 边缘 HTTP 请求。包含资源与机器人请求，不代表访客人数。');render();}
   else{empty(result.state==='unconfigured'?'接入授权后展示真实数据。':result.state==='unauthorised'?'登录后查看真实数据。':'当前数据不可用，此状态不代表请求量为零。');state(result.state,result.state==='unconfigured'?'等待 Cloudflare 授权':result.state==='unauthorised'?'需要登录':result.state==='limited'?'当前时间范围暂不可用':result.state==='permission'?'Cloudflare 授权需要检查':'Cloudflare 暂时无法读取',result.message||'请稍后重试。');$('health-login').hidden=result.state!=='unauthorised'||!result.loginReady;}
  }catch{if(id===sequence&&active){empty('当前无法读取数据，不代表请求量为零。');state('error','Cloudflare 暂时无法读取','请检查网络后重试；现有网站交互统计不受影响。');}}
  finally{if(id===sequence)$('health-refresh').disabled=false;}
 }
 function activate(nextDemo){active=true;demo=nextDemo;$('health-demo').textContent=demo?'返回真实数据':'查看演示数据';load();}
 window.NexbodyHealth={activate,deactivate(){active=false;sequence++;},refresh(){if(active)load();}};
 document.querySelectorAll('[data-health-range]').forEach(button=>button.addEventListener('click',()=>{range=button.dataset.healthRange;document.querySelectorAll('[data-health-range]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));load();}));
 $('health-refresh').addEventListener('click',load);$('health-demo').addEventListener('click',()=>$('demo').click());
 $('health-export').addEventListener('click',()=>{if(!data)return;const rows=[['来源',demo?'Cloudflare 演示数据':'Cloudflare'],['域名',data.host],['窗口开始 UTC',data.window.start],['窗口结束 UTC',data.window.end],['读取时间 UTC',data.fetchedAt],['说明','请求次数不是访客数；与 Turso 交互数据独立'],[],['HTTP 请求量',data.totals.requests],['流量（字节）',data.totals.bytes],['缓存 HIT 占比（%）',data.totals.cacheHitRate??'无分母或不可用'],['5xx 响应占比（%）',data.totals.serverErrorRate??'无分母或不可用'],[],['趋势时间 UTC','请求量'],...data.trend.map(r=>[r.time,r.requests]),[],['国家或地区','请求量'],...data.countries.map(r=>[r.country,r.requests]),[],['缓存状态','请求量'],...data.cache.map(r=>[r.status,r.requests]),[],['边缘响应码','请求量'],...data.statuses.map(r=>[r.status,r.requests])];const cell=v=>'"'+String(v??'').replace(/^[=+@-]/,"'$&").replaceAll('"','""')+'"';const csv='\uFEFF'+rows.map(r=>r.map(cell).join(',')).join('\r\n'),url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'})),link=node('a');link.href=url;link.download='NEXBODY-Cloudflare-'+(demo?'DEMO-':'')+range+'.csv';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});
 setInterval(()=>{if(active&&!demo&&document.visibilityState==='visible')load();},300000);
})();
