import { cookies, headers } from "next/headers";
import { analyticsSettings } from "./config";
import { ADMIN_COOKIE } from "./session";
import { UUID } from "./model";
import { saveAggregateInquiry } from "./db";
export async function recordSuccessfulInquiry(eventId:string|undefined) {
  try {const settings=analyticsSettings();if(!settings.enabled||!eventId||!UUID.test(eventId))return;
    const store=await cookies(),requestHeaders=await headers();
    if(store.has(ADMIN_COOKIE)||requestHeaders.get("dnt")==="1"||requestHeaders.get("sec-gpc")==="1")return;
    await saveAggregateInquiry(eventId);
  }catch{/* A statistics failure must never turn a successfully accepted email into a form failure. */}
}
