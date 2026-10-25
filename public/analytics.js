/* Cookieless, event-level aggregates. No visitor identifiers, fingerprinting or form contents. */
(()=>{
  if(window.__nexbodyAnalytics)return;window.__nexbodyAnalytics=true;
  const PREF='nexbody-analytics-optout';
  const selectors={film:'.field-film-section',navigation:'header nav[aria-label="Primary"], [role="dialog"][aria-label="Navigation menu"]',footer:'footer',hero:'.cinematic-hero',values:'.value-pillars-section',products:'.ecosystem-section',assessment:'.intelligence-section',cases:'.case-section',solutions:'#applications',workflow:'#workflow',consultation:'#consultation',services:'.service-section',faq:'.faq-section',final_cta:'.cinematic-final',product_hero:'.product-detail-hero',product_capabilities:'.product-detail-section:has(.product-rule-list)',product_story:'.product-video-story,.f20-workflow-scene',product_specs:'.product-detail-section:has(.product-spec-table)',product_reports:'.product-detail-section:has(.product-report-line)',downloads:'.product-detail-section:has(a[href$=".pdf"])',product_cta:'.product-detail-cta',editorial_hero:'.editorial-hero',editorial_body:'.editorial-sections',related_products:'.editorial-related',editorial_cta:'.editorial-cta',catalog:'.product-index',article_list:'.editorial-page .editorial-grid',contact_form:'form'};
  const restricted=()=>location.pathname.startsWith('/admin');
  const privacy=()=>navigator.doNotTrack==='1'||navigator.globalPrivacyControl===true;
  let optedOut=false;try{optedOut=localStorage.getItem(PREF)==='true'||localStorage.getItem('nexbody-analytics-consent')==='denied';}catch{}
  let queue=[],sending=false,currentPath='',seen=new Set(),timers=new Map(),observer,lastActivity=Date.now(),generation=0;
  const id=()=>crypto.randomUUID();
  const safeCampaign=v=>/^[a-z0-9][a-z0-9_-]{0,79}$/i.test(v||'')?v.toLowerCase():'';
  const attribution=()=>{const q=new URLSearchParams(location.search);let referrer='';try{referrer=new URL(document.referrer).origin;}catch{}return {source:safeCampaign(q.get('utm_source')),medium:safeCampaign(q.get('utm_medium')),campaign:safeCampaign(q.get('utm_campaign')),referrer};};
  let entry=attribution();
  function allowed(){return !optedOut&&!privacy()&&!restricted();}
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
    try{const r=await fetch('/api/analytics/collect',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({mode:'aggregate',...entry,events:batch}),credentials:'same-origin',keepalive:true,signal:AbortSignal.timeout(6000)});if(!r.ok&&r.status>=500&&version===generation)queue.unshift(...batch);}
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
    if(restricted()){resetObservers();return;}
    if(!allowed()||currentPath===location.pathname)return;
    currentPath=location.pathname;event('pageview','page');observe();
  }
  // A quiet footer control replaces the banner. Existing refusals remain respected.
  const controls=()=>document.querySelectorAll('[data-analytics-toggle]');
  function reflectPreference(){
    document.documentElement.dataset.analyticsDisabled=String(optedOut||privacy());
    for(const control of controls()){
      control.textContent=privacy()?'Analytics disabled by browser':optedOut?'Enable basic analytics':'Disable basic analytics';
      control.setAttribute('aria-pressed',String(optedOut||privacy()));control.disabled=privacy();
    }
  }
  reflectPreference();
  fetch('/api/analytics/forget',{method:'POST',credentials:'same-origin'}).catch(()=>{});
  document.addEventListener('click',e=>{
    const control=e.target.closest('[data-analytics-toggle]');if(!control)return;
    e.preventDefault();if(privacy())return;optedOut=!optedOut;
    try{localStorage.setItem(PREF,String(optedOut));localStorage.removeItem('nexbody-analytics-consent');}catch{}
    reflectPreference();generation++;queue=[];resetObservers();
    if(!optedOut){currentPath='';page();}
  });
  const originalPage=page;
  function navigation(){reflectPreference();originalPage();}
  document.addEventListener('click',e=>{
    if(!allowed()||!e.isTrusted)return;
    const link=e.target.closest('a[href]'),button=e.target.closest('button');if(!link&&!button)return;
    const element=link||button;if(element.closest('[data-analytics-toggle]'))return;
    let action='navigate';
    if(link){const url=new URL(link.href,location.origin);if(url.protocol==='mailto:')action='email';else if(/\.(pdf|zip|docx?)(?:$|[?#])/i.test(url.pathname)||link.hasAttribute('download'))action='download';else if(url.origin!==location.origin)action=/instagram|facebook|linkedin|twitter|youtube/.test(url.hostname)?'social':'external';else if(url.pathname==='/contact')action='consultation';}
    else if(!['Open menu','Close menu'].includes(button.getAttribute('aria-label'))&&!button.getAttribute('aria-label')?.startsWith('Toggle '))return;
    const moduleId=moduleOf(element);impression(moduleId);event('click',moduleId,action);
  },true);
  const playGestures=new WeakMap();
  function notePlayGesture(e){if(!e.isTrusted||!allowed())return;const video=e.target instanceof HTMLVideoElement?e.target:e.target.closest('[data-analytics-play]')?.closest('section')?.querySelector('video');if(video)playGestures.set(video,Date.now());}
  document.addEventListener('pointerdown',notePlayGesture,true);document.addEventListener('keydown',notePlayGesture,true);
  document.addEventListener('play',e=>{if(allowed()&&e.target instanceof HTMLVideoElement&&!e.target.autoplay&&Date.now()-(playGestures.get(e.target)||0)<2000){playGestures.delete(e.target);const moduleId=moduleOf(e.target);impression(moduleId);event('click',moduleId,'video_play');}},true);
  document.addEventListener('visibilitychange',()=>{if(document.hidden){resetObservers();flush();}else observe();});
  addEventListener('nexbody:page',navigation);addEventListener('pagehide',flush);
  page();
})();
