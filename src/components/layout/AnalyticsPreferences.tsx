"use client";

import Link from "next/link";
import { useRef, useState, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";

const BASIC = "nexbody-analytics-optout";
const GOOGLE = "nexbody-google-analytics-consent";
const META = "nexbody-meta-pixel-consent";
const privacySignal = () => navigator.doNotTrack === "1" || (navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl === true;
function subscribe(update: () => void) {
  window.addEventListener("storage", update);
  window.addEventListener("nexbody:optional-consent", update);
  return () => { window.removeEventListener("storage", update); window.removeEventListener("nexbody:optional-consent", update); };
}
function consentSnapshot(googleEnabled: boolean, metaEnabled: boolean) {
  if (privacySignal()) return "blocked";
  try {
    const legacyDeclined = localStorage.getItem("nexbody-analytics-consent") === "denied";
    const googleChoice = googleEnabled ? (localStorage.getItem(GOOGLE) || (legacyDeclined ? "denied" : null)) : "settled";
    const metaChoice = metaEnabled ? (localStorage.getItem(META) || (legacyDeclined ? "denied" : null)) : "settled";
    if (googleChoice && metaChoice) return "settled";
    return "unknown";
  } catch { return "blocked"; }
}

export function AnalyticsPreferences({ googleEnabled, metaEnabled }: { googleEnabled: boolean; metaEnabled: boolean }) {
  const pathname = usePathname();
  const dialog = useRef<HTMLDialogElement>(null);
  const choice = useSyncExternalStore(subscribe, () => consentSnapshot(googleEnabled, metaEnabled), () => "pending");
  const banner = (googleEnabled || metaEnabled) && choice === "unknown";
  const [basic, setBasic] = useState(true);
  const [google, setGoogle] = useState(false);
  const [meta, setMeta] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [message, setMessage] = useState("");

  function readPreferences() {
    const signal = privacySignal();
    setBlocked(signal);
    try {
      setBasic(!signal && localStorage.getItem(BASIC) !== "true" && localStorage.getItem("nexbody-analytics-consent") !== "denied");
      setGoogle(!signal && localStorage.getItem(GOOGLE) === "granted");
      setMeta(!signal && localStorage.getItem(META) === "granted");
    } catch { setBasic(!signal); setGoogle(false); setMeta(false); }
  }

  function save(nextBasic: boolean, nextGoogle: boolean, nextMeta: boolean) {
    try {
      localStorage.setItem(BASIC, String(!nextBasic));
      localStorage.removeItem("nexbody-analytics-consent");
      localStorage.setItem(GOOGLE, nextGoogle ? "granted" : "denied");
      localStorage.setItem(META, nextMeta ? "granted" : "denied");
    } catch {
      setMessage("Your browser could not save preferences. Optional analytics and advertising remain off.");
      return;
    }
    window.dispatchEvent(new CustomEvent("nexbody:basic-analytics-preference", { detail: { enabled: nextBasic } }));
    window.dispatchEvent(new Event("nexbody:optional-consent"));
    dialog.current?.close();
    setMessage("Analytics preferences saved.");
  }

  function currentBasicPreference() {
    try { return localStorage.getItem(BASIC) !== "true" && localStorage.getItem("nexbody-analytics-consent") !== "denied"; }
    catch { return false; }
  }

  if (pathname.startsWith("/admin")) return null;
  return <>
    <button type="button" className="analytics-preferences-link" onClick={() => { readPreferences(); dialog.current?.showModal(); }}>Analytics preferences</button>
    <span role="status" className="sr-only">{message}</span>
    {banner && <aside className="google-consent-banner" aria-label="Optional analytics and advertising">
      <div><strong>Help us understand how the site is used</strong><p>Optional measurement sends usage events to {[googleEnabled && "Google Analytics", metaEnabled && "Meta"].filter(Boolean).join(" and ")}. Choose what you allow. <Link href="/privacy">Privacy policy</Link></p></div>
      <div className="consent-actions"><button type="button" onClick={() => { readPreferences(); dialog.current?.showModal(); }}>Preferences</button><button type="button" onClick={() => save(currentBasicPreference(), false, false)}>Decline optional</button><button type="button" className="consent-primary" onClick={() => save(currentBasicPreference(), !privacySignal() && googleEnabled, !privacySignal() && metaEnabled)}>Allow optional</button></div>
    </aside>}
    <dialog ref={dialog} className="analytics-preferences-dialog" aria-labelledby="analytics-preferences-title">
      <h2 id="analytics-preferences-title">Analytics preferences</h2>
      <p>Choose which optional services may measure website use. Contact forms work with any choice.</p>
      {blocked && <p className="privacy-signal">Your browser privacy signal disables optional analytics.</p>}
      <label><input type="checkbox" checked={basic} disabled={blocked} onChange={e => setBasic(e.target.checked)} /><span><strong>Basic website statistics</strong><small>First-party counts of pages and interactions. No visitor-identification cookies or form contents.</small></span></label>
      {googleEnabled && <label><input type="checkbox" checked={google} disabled={blocked} onChange={e => setGoogle(e.target.checked)} /><span><strong>Google Analytics</strong><small>Optional cookies and usage data sent to Google to measure visits, sources and engagement.</small></span></label>}
      {metaEnabled && <label><input type="checkbox" checked={meta} disabled={blocked} onChange={e => setMeta(e.target.checked)} /><span><strong>Meta advertising measurement</strong><small>Page visits and successful inquiries are sent to Meta to measure ads and build advertising audiences. No inquiry form details are sent.</small></span></label>}
      <p><Link href="/privacy">Read our privacy policy</Link></p>
      <div className="consent-actions"><button type="button" onClick={() => dialog.current?.close()}>Cancel</button><button type="button" className="consent-primary" onClick={() => save(!blocked && basic, googleEnabled && !blocked && google, metaEnabled && !blocked && meta)}>Save preferences</button></div>
    </dialog>
  </>;
}
