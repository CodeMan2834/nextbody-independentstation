"use client";
import Script from "next/script";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
export function AnalyticsClient({enabled, googleId}:{enabled:boolean; googleId:string}) {
 const pathname=usePathname();
 useEffect(()=>{window.dispatchEvent(new Event('nexbody:page'));},[pathname]);
 if(pathname.startsWith('/admin'))return null;
 return <>{enabled && <Script src="/analytics.js" strategy="afterInteractive" onLoad={()=>window.dispatchEvent(new Event('nexbody:page'))} />}{googleId && <Script src="/google-analytics.js" strategy="afterInteractive" data-google-measurement-id={googleId} />}</>;
}
