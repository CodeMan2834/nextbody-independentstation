"use client";

import Link from "next/link";
import { useRef, useState, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";

const BASIC = "nexbody-analytics-optout";
const GOOGLE = "nexbody-google-analytics-consent";
const privacySignal = () => navigator.doNotTrack === "1" || (navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl === true;
function subscribe(update: () => void) {
  window.addEventListener("storage", update);
  window.addEventListener("nexbody:google-consent", update);
  return () => { window.removeEventListener("storage", update); window.removeEventListener("nexbody:google-consent", update); };
}
function consentSnapshot() {
  if (privacySignal()) return "blocked";
  try {
    const choice = localStorage.getItem(GOOGLE);
    if (choice) return choice;
    if (localStorage.getItem(BASIC) === "true" || localStorage.getItem("nexbody-analytics-consent") === "denied") return "blocked";
    return "unknown";
  } catch { return "blocked"; }
}

export function AnalyticsPreferences({ googleEnabled }: { googleEnabled: boolean }) {
  const pathname = usePathname();
  const dialog = useRef<HTMLDialogElement>(null);
  const choice = useSyncExternalStore(subscribe, consentSnapshot, () => "pending");
  const banner = googleEnabled && choice === "unknown";
  const [basic, setBasic] = useState(true);
  const [google, setGoogle] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [message, setMessage] = useState("");

  function readPreferences() {
    const signal = privacySignal();
    setBlocked(signal);
    try {
      setBasic(!signal && localStorage.getItem(BASIC) !== "true" && localStorage.getItem("nexbody-analytics-consent") !== "denied");
      setGoogle(!signal && localStorage.getItem(GOOGLE) === "granted");
    } catch { setBasic(!signal); setGoogle(false); }
  }

  function save(nextBasic: boolean, nextGoogle: boolean) {
    try {
      localStorage.setItem(BASIC, String(!nextBasic));
      localStorage.removeItem("nexbody-analytics-consent");
      localStorage.setItem(GOOGLE, nextGoogle ? "granted" : "denied");
    } catch {
      setMessage("Your browser could not save preferences. Google Analytics remains off.");
      return;
    }
    window.dispatchEvent(new CustomEvent("nexbody:basic-analytics-preference", { detail: { enabled: nextBasic } }));
    window.dispatchEvent(new Event("nexbody:google-consent"));
    dialog.current?.close();
    setMessage("Analytics preferences saved.");
  }

  if (pathname.startsWith("/admin")) return null;
  return <>
    <button type="button" className="analytics-preferences-link" onClick={() => { readPreferences(); dialog.current?.showModal(); }}>Analytics preferences</button>
    <span role="status" className="sr-only">{message}</span>
    {banner && googleEnabled && <aside className="google-consent-banner" aria-label="Optional Google Analytics">
      <div><strong>Help us improve your experience</strong><p>Allow optional Google Analytics to understand visits and content use. Usage data is sent to Google. <Link href="/privacy">Privacy policy</Link></p></div>
      <div className="consent-actions"><button type="button" onClick={() => { readPreferences(); dialog.current?.showModal(); }}>Preferences</button><button type="button" onClick={() => { let allowBasic = !privacySignal(); try { allowBasic = allowBasic && localStorage.getItem(BASIC) !== "true"; } catch { /* Keep the current basic setting. */ } save(allowBasic, false); }}>Decline</button><button type="button" className="consent-primary" onClick={() => save(true, !privacySignal())}>Allow Google Analytics</button></div>
    </aside>}
    <dialog ref={dialog} className="analytics-preferences-dialog" aria-labelledby="analytics-preferences-title">
      <h2 id="analytics-preferences-title">Analytics preferences</h2>
      <p>Choose how we measure website use. Contact forms work with either setting.</p>
      {blocked && <p className="privacy-signal">Your browser privacy signal disables optional analytics.</p>}
      <label><input type="checkbox" checked={basic} disabled={blocked} onChange={e => setBasic(e.target.checked)} /><span><strong>Basic website statistics</strong><small>First-party counts of pages and interactions. No visitor-identification cookies or form contents.</small></span></label>
      {googleEnabled && <label><input type="checkbox" checked={google} disabled={blocked} onChange={e => setGoogle(e.target.checked)} /><span><strong>Google Analytics</strong><small>Optional cookies and usage data sent to Google to measure visits, sources and engagement. Off until you allow it.</small></span></label>}
      <p><Link href="/privacy">Read our privacy policy</Link></p>
      <div className="consent-actions"><button type="button" onClick={() => dialog.current?.close()}>Cancel</button><button type="button" className="consent-primary" onClick={() => save(!blocked && basic, googleEnabled && !blocked && google)}>Save preferences</button></div>
    </dialog>
  </>;
}
