import { createClient, type Client, type InStatement } from "@libsql/client";
import { createHmac } from "node:crypto";
import { analyticsSettings } from "./config";
import { dayAt, type AnalyticsEvent } from "./model";
let client:Client|undefined, signature="";
export function database() {
  const s=analyticsSettings();if(!s.database)throw Error("数据库尚未配置");
  const next=s.url+s.token;
  if(!client||signature!==next){client?.close();signature=next;client=createClient({url:s.url,authToken:s.token||undefined,fetch:(input: RequestInfo | URL,init?: RequestInit)=>fetch(input,{...init,signal:AbortSignal.timeout(2500)})});}
  return client;
}
export type Visit={id:string;channel:string;source:string;medium:string;campaign:string;entry_path:string;device:string};
export async function rateAllowed(address:string,now=Date.now()) {
  const secret=analyticsSettings().secret;
  const minute=Math.floor(now/60000);
  const key=createHmac("sha256",secret).update(`rate:${minute}:${address}`).digest("hex");
  const result=await database().execute({sql:"INSERT INTO analytics_limits(key,hits,expires) VALUES(?,1,?) ON CONFLICT(key) DO UPDATE SET hits=hits+1 RETURNING hits",args:[key,now+120000]});
  return Number(result.rows[0].hits)<=120;
}
export async function saveEvents(visit:Visit,events:AnalyticsEvent[],now=Date.now()) {
  const statements:InStatement[]=[{sql:"INSERT OR IGNORE INTO analytics_sessions(id,started_at,last_seen,channel,source,medium,campaign,entry_path,device) VALUES(?,?,?,?,?,?,?,?,?)",args:[visit.id,now,now,visit.channel,visit.source,visit.medium,visit.campaign,visit.entry_path,visit.device]}];
  for(const e of events)statements.push({sql:"INSERT OR IGNORE INTO analytics_events(id,sid,at,day,kind,path,module,action) VALUES(?,?,?,?,?,?,?,?)",args:[e.id,visit.id,now,dayAt(now),e.kind,e.path,e.module,e.action]});
  await database().batch(statements,"write");
}
// Called only by the successful server-side inquiry action, never by public event input.
export async function saveInquiry(sessionId:string,eventId:string) {
  const db=database(),now=Date.now();
  await db.execute({sql:"INSERT OR IGNORE INTO analytics_events(id,sid,at,day,kind,path,module,action) SELECT ?,id,?,?,'inquiry','/contact','contact_form','accepted' FROM analytics_sessions WHERE id=? AND last_seen>=?",args:[eventId,now,dayAt(now),sessionId,now-1800000]});
}
export async function cleanup(now=Date.now()) {
  await database().batch([
    {sql:"DELETE FROM analytics_limits WHERE expires<?",args:[now]},
    {sql:"DELETE FROM analytics_events WHERE at<?",args:[now-90*86400000]},
    {sql:"DELETE FROM analytics_daily WHERE day<?",args:[dayAt(now-365*86400000)]},
    {sql:"DELETE FROM analytics_sessions WHERE last_seen<? AND NOT EXISTS(SELECT 1 FROM analytics_daily WHERE sid=analytics_sessions.id) AND NOT EXISTS(SELECT 1 FROM analytics_events WHERE sid=analytics_sessions.id)",args:[now-365*86400000]},
  ],"write");
}

export function closeDatabase() { client?.close(); client=undefined; signature=""; }
