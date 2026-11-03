/* CMS live preview, using Decap's own React instance. */
(() => {
  const h = window.h;
  const fonts = { merriweather: 'Merriweather, Georgia, serif', system: 'Arial, sans-serif', arial: 'Arial, sans-serif', georgia: 'Georgia, serif' };
  CMS.registerPreviewTemplate('site-settings', ({ entry, getAsset }) => {
    const data = entry.get('data').toJS(), brand = data.branding || {}, type = data.typography || {};
    const source = brand.mode === 'custom' && brand.logo ? String(getAsset(brand.logo)) : '/brand/nexbody-logo-white.png';
    const preview = mobile => h('section', { key: String(mobile), style: { background: '#080d15', color: '#f5f8fb', padding: '24px', border: '1px solid #293b50', marginBottom: '20px', maxWidth: mobile ? '375px' : 'none', fontFamily: fonts[type.bodyFont] || fonts.system } },
      h('p', { style: { color: '#8eabc0', fontSize: '12px' } }, mobile ? '手机样式' : '电脑样式'),
      h('img', { src: source, alt: data.siteName || 'NEXBODY', style: { height: (mobile ? brand.mobileHeight : brand.desktopHeight) || 26, maxWidth: '100%', objectFit: 'contain', margin: '16px 0' } }),
      h('h1', { style: { fontFamily: fonts[type.headingFont] || fonts.merriweather, fontSize: (mobile ? type.titleMobile : type.titleDesktop) || 36, lineHeight: 1.2 } }, 'Understand your body.'),
      h('h2', { style: { fontFamily: fonts[type.headingFont] || fonts.merriweather, fontSize: (mobile ? type.sectionMobile : type.sectionDesktop) || 28, lineHeight: 1.3 } }, 'Clear insights. Better decisions.'),
      h('p', { style: { fontSize: (mobile ? type.bodyMobile : type.bodyDesktop) || 16, lineHeight: 1.7 } }, 'Professional body assessment for your team. 预览仅展示品牌和文字样式，正式页面会自适应布局。'),
      h('span', { style: { display: 'inline-block', background: '#2b6fff', padding: '10px 18px', borderRadius: '4px', fontFamily: fonts[type.buttonFont] || fonts.system, fontSize: (mobile ? type.buttonMobile : type.buttonDesktop) || 14 } }, 'Contact us'));
    return h('div', {}, h('style', {}, '@font-face{font-family:Merriweather;src:url(/brand/merriweather-latin.woff2) format("woff2");font-weight:300 900;font-display:swap}'), h('h2', {}, '品牌与文字样式预览'), preview(false), preview(true));
  });
})();
