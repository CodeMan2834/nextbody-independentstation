"use client";
import Script from "next/script";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
export function AnalyticsClient({enabled}:{enabled:boolean}) {
 const pathname=usePathname();
 useEffect(()=>{if(enabled)window.dispatchEvent(new Event('nexbody:page'));},[pathname,enabled]);
 if(!enabled||pathname.startsWith('/admin'))return null;
 return <Script src="/analytics.js" strategy="afterInteractive" onLoad={()=>window.dispatchEvent(new Event('nexbody:page'))} />;
}
