import { cookies, headers } from "next/headers";
import { analyticsSettings } from "./config";
import { openVisit, VISIT_COOKIE, ADMIN_COOKIE } from "./session";
import { UUID } from "./model";
import { saveInquiry } from "./db";
export async function recordSuccessfulInquiry(eventId:string|undefined) {
  try {const settings=analyticsSettings();if(!settings.enabled||!eventId||!UUID.test(eventId))return;
    const store=await cookies(),requestHeaders=await headers();
    if(store.has(ADMIN_COOKIE)||requestHeaders.get("dnt")==="1"||requestHeaders.get("sec-gpc")==="1")return;
    const sid=openVisit(store.get(VISIT_COOKIE)?.value,settings.secret);if(sid)await saveInquiry(sid,eventId);
  }catch{/* A statistics failure must never turn a successfully accepted email into a form failure. */}
}
