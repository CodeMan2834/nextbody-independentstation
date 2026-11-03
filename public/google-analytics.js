/* Optional GA4. No Google script or request before explicit consent. */
(() => {
  if (window.__nexbodyGoogleAnalytics) return;
  window.__nexbodyGoogleAnalytics = true;
  const script = document.querySelector('script[data-google-measurement-id]');
  const id = script?.dataset.googleMeasurementId || '';
  if (!/^G-[A-Z0-9]{5,20}$/.test(id)) return;
  const key = 'nexbody-google-analytics-consent';
  const restricted = () => location.pathname.startsWith('/admin') || !['nexbodyfit.com', 'www.nexbodyfit.com'].includes(location.hostname);
  const signal = () => navigator.doNotTrack === '1' || navigator.globalPrivacyControl === true;
  let initialized = false;
  function allowed() {
    try { return !restricted() && !signal() && localStorage.getItem(key) === 'granted'; } catch { return false; }
  }
  function clearCookies() {
    const domains = ['', location.hostname, '.nexbodyfit.com'];
    for (const cookie of document.cookie.split(';')) {
      const name = cookie.split('=')[0].trim();
      if (!/^_ga(?:_|$)/.test(name)) continue;
      for (const domain of domains) document.cookie = `${name}=; Max-Age=0; Path=/; SameSite=Lax${domain ? '; Domain=' + domain : ''}`;
    }
  }
  function consent() {
    const granted = allowed();
    window['ga-disable-' + id] = !granted;
    if (!granted) {
      if (initialized) window.gtag('consent', 'update', { analytics_storage: 'denied', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });
      clearCookies();
      return;
    }
    if (initialized) {
      window.gtag('consent', 'update', { analytics_storage: 'granted', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });
      return;
    }
    initialized = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('consent', 'default', { analytics_storage: 'denied', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });
    window.gtag('consent', 'update', { analytics_storage: 'granted', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });
    window.gtag('js', new Date());
    // Enhanced measurement handles History API navigation. Do not also emit manual page_view events.
    window.gtag('config', id, { allow_google_signals: false, allow_ad_personalization_signals: false });
    const tag = document.createElement('script');
    tag.async = true; tag.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
    tag.id = 'nexbody-google-tag'; document.head.appendChild(tag);
  }
  function track(name, fields) {
    if (allowed() && initialized) window.gtag('event', name, fields);
  }
  const products = { '/products/nexbody-x60': 'nexbody-x60', '/products/onescan-gait-analysis': 'onescan-gait-analysis', '/products/f20-foot-scanner': 'f20-foot-scanner' };
  document.addEventListener('click', event => {
    if (!event.isTrusted || !allowed()) return;
    const link = event.target.closest('a[href]');
    if (!link) return;
    const url = new URL(link.href, location.origin);
    if (url.origin === location.origin && products[url.pathname]) track('select_content', { content_type: 'product', item_id: products[url.pathname] });
    else if (url.origin === location.origin && url.pathname === '/contact') track('contact_click', { contact_method: 'form' });
    else if (url.protocol === 'mailto:') track('contact_click', { contact_method: 'email' });
  });
  addEventListener('nexbody:inquiry-success', () => track('generate_lead', { form_name: 'contact', lead_type: 'product_inquiry' }));
  addEventListener('nexbody:google-consent', consent);
  addEventListener('nexbody:page', consent);
  addEventListener('storage', consent);
  consent();
})();
