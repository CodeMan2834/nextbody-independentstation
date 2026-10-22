import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { analyticsSettings } from "@/lib/analytics/config";
import { attribution, ACTIONS, MODULES, PUBLIC_KINDS, UUID, type AnalyticsEvent } from "@/lib/analytics/model";
import { openVisit, signVisit, VISIT_COOKIE, ADMIN_COOKIE } from "@/lib/analytics/session";
import { rateAllowed, saveEvents } from "@/lib/analytics/db";
import { PRODUCT_SLUGS } from "@/lib/products";
import { SOLUTIONS, PUBLISHED_POSTS } from "@/lib/editorial";
export const runtime="nodejs";
const paths=new Set(['/','/about','/products','/solutions','/blog','/contact','/success','/privacy','/terms',...PRODUCT_SLUGS.map(s=>'/products/'+s),...SOLUTIONS.map(s=>'/solutions/'+s.slug),...PUBLISHED_POSTS.map(s=>'/blog/'+s.slug)]);
export async function POST(request:NextRequest) {
  const settings=analyticsSettings();
  const reply=(status=204)=>new NextResponse(null,{status,headers:{'Cache-Control':'no-store'}});
  if(!settings.enabled)return reply();
  const origin=new URL(request.url).origin;
  const expected=process.env.CMS_SITE_URL||'https://nexbodyfit.com';
  const local=process.env.NODE_ENV!=='production'&&['localhost','127.0.0.1'].includes(new URL(origin).hostname);
  if(request.headers.get('origin')!==origin||(!local&&origin!==expected))return reply(403);
  if(request.headers.get('dnt')==='1'||request.headers.get('sec-gpc')==='1'||request.cookies.has(ADMIN_COOKIE)||/bot|crawler|spider|headless|preview/i.test(request.headers.get('user-agent')||''))return reply();
  if(!request.headers.get('content-type')?.startsWith('application/json'))return reply(415);
  if(Number(request.headers.get('content-length')||0)>12000)return reply(413);
  try {
    const text=await request.text();if(Buffer.byteLength(text)>12000)return reply(413);
    const input=JSON.parse(text);
    if(input.consent!=='granted'||!Array.isArray(input.events)||!input.events.length||input.events.length>12)return reply(400);
    const events:AnalyticsEvent[]=[];
    for(const e of input.events){
      if(!e||!UUID.test(e.id)||!PUBLIC_KINDS.includes(e.kind)||!paths.has(e.path)||!Object.hasOwn(MODULES,e.module)||typeof e.action!=='string'||(e.kind==='click'&&!ACTIONS.includes(e.action))||(e.kind!=='click'&&e.action!==''))return reply(400);
      events.push({id:e.id,kind:e.kind,path:e.path,module:e.module,action:e.action});
    }
    const address=request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()||'unknown';
    if(!await rateAllowed(address))return reply(429);
    const id=openVisit(request.cookies.get(VISIT_COOKIE)?.value,settings.secret)||randomUUID();
    const source=attribution(input,origin),ua=request.headers.get('user-agent')||'';
    await saveEvents({id,...source,entry_path:events[0].path,device:/iPad|Tablet|Android(?!.*Mobile)/i.test(ua)?'tablet':/Mobile|iPhone/i.test(ua)?'mobile':'desktop'},events);
    const response=reply();response.cookies.set(VISIT_COOKIE,signVisit(id,settings.secret),{httpOnly:true,secure:!local,sameSite:'lax',maxAge:1800,path:'/'});return response;
  }catch{return reply(503);}
}
