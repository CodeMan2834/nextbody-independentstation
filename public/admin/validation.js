(function(root) {
  function validate(data, fields, collection) {
    const errors=[];
    const localPath=v=>{
      if(typeof v!=='string'||!/^\/(?!\/)[^\\\s]*$/.test(v))return false;
      try { const decoded=decodeURIComponent(v.split(/[?#]/)[0]); return !decoded.startsWith('//')&&!decoded.includes('\\')&&!decoded.split('/').some(p=>p==='..'||p==='.')&&!/[\x00-\x1f]/.test(decoded); } catch { return false; }
    };
    const safeLink=v=>localPath(v)||/^#[\w-]+$/.test(v)||/^https:\/\/[a-z0-9]/i.test(v)||/^mailto:[^\s@]+@[^\s@]+\.[^\s@]+$/i.test(v);
    const routes=new Set(['/','/products','/contact','/success','/privacy','/terms','/products/nexbody-x60','/products/onescan-gait-analysis','/products/f20-foot-scanner','/about','/solutions','/blog','/solutions/fitness-sports','/solutions/healthcare','/solutions/beauty-wellness','/solutions/orthopedic','/solutions/foot-orthotics-footwear','/solutions/rehabilitation-therapy']);
    const anchors=new Set(['workflow','products','applications','consultation','main-content','home-title','value-pillars-title','intelligence-title','case-title','industry-title','service-title','faq-title']);
    function walk(obj, defs, prefix='') {
      if(!obj||typeof obj!=='object'||Array.isArray(obj)){errors.push(prefix+'：内容格式不正确');return;}
      for(const f of defs) {
        const value=obj?.[f.name], label=prefix+f.label;
        const empty=value===undefined||value===null||value==='';
        if(empty){if(f.required!==false)errors.push(label+'：请填写');continue;}
        if(f.widget==='object'){if(typeof value!=='object'||Array.isArray(value))errors.push(label+'：格式不正确');else walk(value,f.fields,label+' / ');}
        else if(f.widget==='list'){
          if(!Array.isArray(value)){errors.push(label+'：必须为列表');continue;}
          if(f.min&&value.length<f.min)errors.push(label+'：至少 '+f.min+' 条');
          if(f.max&&value.length>f.max)errors.push(label+'：最多 '+f.max+' 条');
          value.forEach((item,i)=>{if(f.fields)walk(item,f.fields,label+' '+(i+1)+' / ');else if(typeof item!=='string'||!item.trim())errors.push(label+'：不能有空条目');});
        }else if(f.widget==='number'){
          if(!Number.isFinite(value)||!Number.isInteger(value)||(f.min!==undefined&&value<f.min)||(f.max!==undefined&&value>f.max))errors.push(label+'：请输入范围内的整数');
        }else if(typeof value!=='string'||!value.trim()) errors.push(label+'：请填写有效文字');
        else {
          if(f.pattern&&!(new RegExp(f.pattern[0])).test(value))errors.push(label+'：'+f.pattern[1]);
          if(f.widget==='select'&&!f.options.some(x=>(typeof x==='string'?x:x.value)===value))errors.push(label+'：选择无效');
          if(['image','file'].includes(f.widget)&&!localPath(value))errors.push(label+'：请上传文件或使用本站以 / 开头的资源路径');
          if(f.widget==='image'&&!/\.(png|jpe?g|webp|gif|avif)$/i.test(value))errors.push(label+'：使用 PNG/JPG/WebP/GIF/AVIF 图片');
          if(/href$/i.test(f.name)&&!safeLink(value))errors.push(label+'：仅支持站内路径、https 或 mailto 链接');
          if(/href$/i.test(f.name)&&(value.startsWith('/')||value.startsWith('#'))&&localPath(value.startsWith('#')?'/'+value:value)){
            const pathname=value.split(/[?#]/)[0]||'/';const anchor=value.includes('#')?value.split('#')[1]:'';
            if(!/\.[a-z0-9]{2,6}$/i.test(pathname)&&!routes.has(pathname)&&!/^\/blog\/[a-z0-9]+(?:-[a-z0-9]+)*$/.test(pathname))errors.push(label+'：站内页面不存在');
            if(pathname==='/'&&anchor&&!anchors.has(anchor))errors.push(label+'：首页锚点不存在');
          }
          if(f.name==='video'&&!/\.mp4$/i.test(value))errors.push(label+'：请使用 MP4 视频');
        }
      }
    }
    walk(data,fields);
    if(!data||typeof data!=='object')return errors;
    if(collection==='settings'){
      if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.contactEmail||''))errors.push('联系邮箱：格式不正确');
      if(data.whatsappNumber&&!/^\+[1-9]\d{7,14}$/.test(data.whatsappNumber))errors.push('WhatsApp：使用 +国家码和号码，不要加空格');
      for(const item of Array.isArray(data.socialLinks)?data.socialLinks:[])if(!/^https:\/\//i.test(item?.href))errors.push('社交链接必须为 https 网址');
    }
    if(collection==='products'){
      const expected=['nexbody-x60','onescan-gait-analysis','f20-foot-scanner'];
      const slugs=(Array.isArray(data.products)?data.products:[]).map(p=>p?.slug);
      if(slugs.length!==3||new Set(slugs).size!==3||expected.some(s=>!slugs.includes(s)))errors.push('必须保留 X60、OneScan、F20 三款产品及原页面标识');
      for(const p of Array.isArray(data.products)?data.products:[]){if(!p||typeof p!=='object')continue;if(p.priority!==(p.slug==='nexbody-x60'?'flagship':'supporting'))errors.push('产品展示级别不可变更');if((p.slug!=='f20-foot-scanner'&&!p.story?.video)||(p.story?.video&&!p.story?.poster))errors.push(p.name+'：需要场景视频和封面');}
    }
    if(collection==='editorial'){
      const expected=["fitness-sports", "healthcare", "beauty-wellness", "orthopedic", "foot-orthotics-footwear", "rehabilitation-therapy"];
      const solutions=Array.isArray(data.solutions)?data.solutions:[];
      if(solutions.length!==expected.length||expected.some(slug=>!solutions.some(item=>item.slug===slug)))errors.push('必须保留六个解决方案及原页面标识');
      const validProducts=['nexbody-x60','onescan-gait-analysis','f20-foot-scanner'];
      for(const item of solutions)if(!Array.isArray(item.productSlugs)||!item.productSlugs.length||item.productSlugs.some(slug=>!validProducts.includes(slug)))errors.push('解决方案：请选择有效关联产品');
      const posts=Array.isArray(data.posts)?data.posts:[];
      if(new Set(posts.map(p=>p.slug)).size!==posts.length)errors.push('文章页面标识不可重复');
    }
    if(collection==='cases'){
      const ids=(Array.isArray(data.cases)?data.cases:[]).map(x=>x?.id);
      if(new Set(ids).size!==ids.length)errors.push('案例编号不可重复');
    }
    if(collection==='homepage')for(const m of Array.isArray(data.hero?.media)?data.hero.media:[]){
      if(!m||typeof m!=='object')continue;
      if(m.type==='video'&&(!/\.mp4$/i.test(m.src)||!m.poster))errors.push('首屏视频必须使用 MP4，并配置封面图');
      if(m.type==='image'&&!/\.(png|jpe?g|webp|gif|avif)$/i.test(m.src))errors.push('首屏图片类型与文件不匹配');
    }
    return errors;
  }
  if(typeof module!=='undefined')module.exports={validate};
  else root.NEXBODY_VALIDATION={validate};
})(typeof window!=='undefined'?window:globalThis);
