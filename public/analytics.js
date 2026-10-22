/* First-party, consent-gated events. Never reads form values or records arbitrary link text. */
(()=>{
  if(window.__nexbodyAnalytics)return;window.__nexbodyAnalytics=true;
  const PREF='nexbody-analytics-consent';
  const selectors={film:'.field-film-section',navigation:'header nav[aria-label="Primary"], [role="dialog"][aria-label="Navigation menu"]',footer:'footer',hero:'.cinematic-hero',values:'.value-pillars-section',products:'.ecosystem-section',assessment:'.intelligence-section',cases:'.case-section',solutions:'#applications',workflow:'#workflow',consultation:'#consultation',services:'.service-section',faq:'.faq-section',final_cta:'.cinematic-final',product_hero:'.product-detail-hero',product_capabilities:'.product-detail-section:has(.product-rule-list)',product_story:'.product-video-story,.f20-workflow-scene',product_specs:'.product-detail-section:has(.product-spec-table)',product_reports:'.product-detail-section:has(.product-report-line)',downloads:'.product-detail-section:has(a[href$=".pdf"])',product_cta:'.product-detail-cta',editorial_hero:'.editorial-hero',editorial_body:'.editorial-sections',related_products:'.editorial-related',editorial_cta:'.editorial-cta',catalog:'.product-index',article_list:'.editorial-page .editorial-grid',contact_form:'form'};
  const restricted=()=>location.pathname.startsWith('/admin');
  const privacy=()=>navigator.doNotTrack==='1'||navigator.globalPrivacyControl===true;
  let preference;try{preference=localStorage.getItem(PREF);}catch{}
  let queue=[],sending=false,currentPath='',seen=new Set(),timers=new Map(),observer,lastActivity=Date.now(),generation=0;
  const id=()=>crypto.randomUUID();
  const safeCampaign=v=>/^[a-z0-9][a-z0-9_-]{0,79}$/i.test(v||'')?v.toLowerCase():'';
  const attribution=()=>{const q=new URLSearchParams(location.search);let referrer='';try{referrer=new URL(document.referrer).origin;}catch{}return {source:safeCampaign(q.get('utm_source')),medium:safeCampaign(q.get('utm_medium')),campaign:safeCampaign(q.get('utm_campaign')),referrer};};
  let entry=attribution();
  function allowed(){return preference==='granted'&&!privacy()&&!restricted();}
  function moduleOf(element){
    if(location.pathname==='/solutions'&&element.closest('.editorial-grid'))return 'solution_list';
    const order=['downloads','product_reports','product_specs','product_capabilities',...Object.keys(selectors).filter(x=>!['downloads','product_reports','product_specs','product_capabilities'].includes(x))];
    for(const name of order)if(element.closest(selectors[name]))return name;
    return 'page';
  }
  function event(kind,moduleId,action=''){
    if(!allowed())return;
    if(Date.now()-lastActivity>1800000){seen.clear();entry={source:'',medium:'',campaign:'',referrer:''};}
    lastActivity=Date.now();queue.push({id:id(),kind,module:moduleId,action,path:location.pathname});if(queue.length>120)queue.shift();
    setTimeout(flush,150);
  }
  function impression(moduleId){const key=location.pathname+':'+moduleId;if(seen.has(key))return;seen.add(key);event('impression',moduleId);}
  async function flush(){
    if(sending||!queue.length||!allowed())return;
    sending=true;const batch=queue.splice(0,12),version=generation;
    try{const r=await fetch('/api/analytics/collect',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({consent:'granted',...entry,events:batch}),credentials:'same-origin',keepalive:true,signal:AbortSignal.timeout(6000)});if(!r.ok&&r.status>=500&&version===generation)queue.unshift(...batch);}
    catch{if(version===generation)queue.unshift(...batch);}
    finally{sending=false;if(queue.length>120)queue=queue.slice(-120);}
    // No retry loop during an outage. The next genuine interaction will flush the bounded queue.
    if(queue.length&&version===generation&&allowed())setTimeout(()=>{if(queue[0]?.id!==batch[0]?.id)flush();},200);
  }
  function resetObservers(){observer?.disconnect();for(const timer of timers.values())clearTimeout(timer);timers.clear();}
  function observe(){
    resetObservers();if(!allowed())return;
    observer=new IntersectionObserver(entries=>{for(const item of entries){const moduleId=item.target.dataset.analyticsExposure;
      if(item.isIntersecting&&item.intersectionRatio>=.5){if(!timers.has(item.target))timers.set(item.target,setTimeout(()=>{impression(moduleId);timers.delete(item.target);},1000));}
      else{clearTimeout(timers.get(item.target));timers.delete(item.target);}
    }},{threshold:[0,.5]});
    for(const [name,selector] of Object.entries(selectors))for(const root of document.querySelectorAll(selector)){
      const target=root.querySelector('h1,h2')||root;if(target.dataset.analyticsExposure)delete target.dataset.analyticsExposure;
      const moduleId=name==='article_list'&&location.pathname==='/solutions'?'solution_list':name;
      // Only the visible heading/core area is observed, so long sections can qualify as exposed.
      target.dataset.analyticsExposure=moduleId;observer.observe(target);
    }
  }
  function page(){
    preferences.hidden=restricted();if(restricted()){resetObservers();return;}
    if(!allowed()||currentPath===location.pathname)return;
    currentPath=location.pathname;event('pageview','page');observe();
  }
  const style=document.createElement('style');style.textContent='.nexbody-consent{position:fixed;bottom:64px;left:20px;z-index:80;max-width:410px;margin-right:20px;background:#111c2c;color:#edf4ff;padding:22px;border:1px solid #3d526c;border-radius:12px;box-shadow:0 12px 50px #0007;font:14px/1.6 Arial,sans-serif}.nexbody-consent p{margin:0 0 16px}.nexbody-consent a{color:#80d8ff;text-decoration:underline}.nexbody-consent div{display:flex;gap:10px;flex-wrap:wrap}.nexbody-consent button{padding:9px 14px;border:1px solid #6d91b3;border-radius:5px;background:transparent;color:white;cursor:pointer}.nexbody-consent button:first-child{background:#2458c4}.nexbody-preferences{position:fixed;bottom:14px;left:18px;z-index:70;color:#b0c0d1;background:#0d1725;border:1px solid #344861;padding:7px 10px;border-radius:5px;font:11px Arial,sans-serif}.nexbody-consent button:focus-visible,.nexbody-preferences:focus-visible{outline:2px solid #80d8ff;outline-offset:3px}';document.head.appendChild(style);
  const banner=document.createElement('section');banner.className='nexbody-consent';banner.setAttribute('aria-label','Analytics preferences');banner.hidden=true;
  banner.innerHTML='<p>Help us understand which products and information are useful. Optional analytics records page visits and interactions, without form contents. <a href="/privacy">Privacy policy</a></p><div><button type="button" data-choice="granted">Allow analytics</button><button type="button" data-choice="denied">Decline analytics</button><button type="button" data-choice="close">Close</button></div>';
  const preferences=document.createElement('button');preferences.type='button';preferences.className='nexbody-preferences';preferences.textContent='Privacy preferences';preferences.addEventListener('click',()=>{banner.hidden=false;banner.querySelector('button')?.focus();});
  document.body.append(preferences,banner);
  banner.addEventListener('click',async e=>{const button=e.target.closest('[data-choice]');if(!button)return;const choice=button.dataset.choice;if(choice==='close'){banner.hidden=true;preferences.focus();return;}
    preference=privacy()?'denied':choice;try{localStorage.setItem(PREF,preference);}catch{}banner.hidden=true;
    if(preference==='granted'){currentPath='';page();}else{generation++;queue=[];resetObservers();try{await fetch('/api/analytics/forget',{method:'POST',credentials:'same-origin'});}catch{}}preferences.focus();
  });
  if(!preference&&!privacy()&&!restricted())banner.hidden=false;
  if(privacy()){preference='denied';banner.querySelector('p').textContent='Optional analytics is disabled because your browser requests privacy protection.';banner.querySelector('[data-choice="granted"]').hidden=true;}
  document.addEventListener('click',e=>{
    if(!allowed()||!e.isTrusted)return;
    const link=e.target.closest('a[href]'),button=e.target.closest('button');if(!link&&!button)return;
    const element=link||button;if(element.closest('.nexbody-consent')||element===preferences)return;
    let action='navigate';
    if(link){const url=new URL(link.href,location.origin);if(url.protocol==='mailto:')action='email';else if(/\.(pdf|zip|docx?)(?:$|[?#])/i.test(url.pathname)||link.hasAttribute('download'))action='download';else if(url.origin!==location.origin)action=/instagram|facebook|linkedin|twitter|youtube/.test(url.hostname)?'social':'external';else if(url.pathname==='/contact')action='consultation';}
    else if(!['Open menu','Close menu'].includes(button.getAttribute('aria-label'))&&!button.getAttribute('aria-label')?.startsWith('Toggle '))return;
    const moduleId=moduleOf(element);impression(moduleId);event('click',moduleId,action);
  },true);
  document.addEventListener('play',e=>{if(allowed()&&e.target instanceof HTMLVideoElement&&!e.target.autoplay){const moduleId=moduleOf(e.target);impression(moduleId);event('click',moduleId,'video_play');}},true);
  document.addEventListener('visibilitychange',()=>{if(document.hidden){resetObservers();flush();}else observe();});
  addEventListener('nexbody:page',page);addEventListener('pagehide',flush);
  page();
})();
