/* Meta Pixel stays unloaded until a visitor explicitly allows Meta advertising measurement. */
(() => {
  if (window.__nexbodyMetaPixelController) return;
  window.__nexbodyMetaPixelController = true;

  const pixelId = document.currentScript?.dataset.metaPixelId || "";
  const consentKey = "nexbody-meta-pixel-consent";
  if (!/^\d{10,20}$/.test(pixelId)) return;

  let initialized = false;
  let currentPath = "";

  function privacySignal() {
    return navigator.doNotTrack === "1" || navigator.globalPrivacyControl === true;
  }

  function allowed() {
    if (location.pathname.startsWith("/admin") || !["nexbodyfit.com", "www.nexbodyfit.com"].includes(location.hostname) || privacySignal()) return false;
    try { return localStorage.getItem(consentKey) === "granted"; } catch { return false; }
  }

  function clearPixelCookies() {
    const domains = ["", location.hostname, ".nexbodyfit.com"];
    for (const cookie of document.cookie.split(";")) {
      const name = cookie.split("=")[0].trim();
      if (!/^_fb(?:p|c)$/.test(name)) continue;
      for (const domain of domains) {
        document.cookie = `${name}=; Max-Age=0; Path=/; SameSite=Lax${domain ? `; Domain=${domain}` : ""}`;
      }
    }
  }

  function loadPixel() {
    if (window.fbq) return;
    const queue = window.fbq = function () {
      if (queue.callMethod) queue.callMethod.apply(queue, arguments);
      else queue.queue.push(arguments);
    };
    if (!window._fbq) window._fbq = queue;
    queue.push = queue;
    queue.loaded = true;
    queue.version = "2.0";
    queue.queue = [];
    const tag = document.createElement("script");
    tag.async = true;
    tag.src = "https://connect.facebook.net/en_US/fbevents.js";
    tag.id = "nexbody-meta-pixel-tag";
    document.head.appendChild(tag);
  }

  function start() {
    if (!allowed()) {
      if (initialized && window.fbq) window.fbq("consent", "revoke");
      clearPixelCookies();
      return false;
    }

    loadPixel();
    if (!initialized) {
      window.fbq("init", pixelId);
      initialized = true;
    }
    window.fbq("consent", "grant");
    return true;
  }

  function pageView() {
    if (!start() || currentPath === location.pathname) return;
    currentPath = location.pathname;
    window.fbq("track", "PageView");
  }

  function withdraw() {
    if (initialized && window.fbq) window.fbq("consent", "revoke");
    clearPixelCookies();
  }

  addEventListener("nexbody:page", pageView);
  addEventListener("nexbody:optional-consent", () => {
    if (allowed()) {
      currentPath = "";
      pageView();
    } else withdraw();
  });
  addEventListener("storage", () => {
    if (allowed()) {
      currentPath = "";
      pageView();
    } else withdraw();
  });
  addEventListener("nexbody:inquiry-success", () => {
    if (start()) window.fbq("track", "Lead");
  });
  pageView();
})();
