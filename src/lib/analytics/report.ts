import { database } from "./db";
import { CHANNELS, dateRange, MODULES } from "./model";
import { PRODUCT_SLUGS } from "../products";
export function reportFilters(params:URLSearchParams) {
  const range=dateRange(params), channel=params.get("channel")||"", device=params.get("device")||"", product=params.get("product")||"";
  if(channel&&!Object.hasOwn(CHANNELS,channel))throw Error("渠道筛选无效");
  if(device&&!["desktop","tablet","mobile"].includes(device))throw Error("设备筛选无效");
  if(product&&!PRODUCT_SLUGS.includes(product as typeof PRODUCT_SLUGS[number]))throw Error("产品筛选无效");
  return {range,channel,device,product};
}
export async function report(params:URLSearchParams) {
  const {range,channel,device,product}=reportFilters(params);
  const clauses=["d.day BETWEEN ? AND ?"],args:(string|number)[]=[range.from,range.to];
  if(channel){clauses.push("s.channel=?");args.push(channel);}
  if(device){clauses.push("s.device=?");args.push(device);}
  if(product){clauses.push("EXISTS(SELECT 1 FROM analytics_daily p WHERE p.sid=s.id AND p.kind='pageview' AND p.path=? AND p.day BETWEEN ? AND ?)");args.push('/products/'+product,range.from,range.to);}
  const base=" FROM analytics_daily d JOIN analytics_sessions s ON s.id=d.sid WHERE "+clauses.join(" AND ");
  const queries=[
    "SELECT COUNT(DISTINCT d.sid) sessions, COALESCE(SUM(CASE WHEN d.kind='pageview' THEN d.count ELSE 0 END),0) pageviews, COALESCE(SUM(CASE WHEN d.kind='click' AND d.action='consultation' THEN d.count ELSE 0 END),0) consultations, COALESCE(SUM(CASE WHEN d.kind='inquiry' THEN d.count ELSE 0 END),0) inquiries"+base,
    "SELECT d.day,COUNT(DISTINCT d.sid) sessions,SUM(CASE WHEN d.kind='pageview' THEN d.count ELSE 0 END) pageviews,SUM(CASE WHEN d.kind='inquiry' THEN d.count ELSE 0 END) inquiries"+base+" GROUP BY d.day ORDER BY d.day",
    "SELECT s.channel,s.source,s.campaign,COUNT(DISTINCT d.sid) sessions,SUM(CASE WHEN d.kind='pageview' THEN d.count ELSE 0 END) pageviews,SUM(CASE WHEN d.kind='inquiry' THEN d.count ELSE 0 END) inquiries"+base+" GROUP BY s.channel,s.source,s.campaign ORDER BY sessions DESC LIMIT 100",
    "SELECT d.path,COUNT(DISTINCT d.sid) sessions,SUM(d.count) pageviews"+base+" AND d.kind='pageview' GROUP BY d.path ORDER BY pageviews DESC LIMIT 100",
    "SELECT d.path,d.module,COUNT(DISTINCT CASE WHEN d.kind='impression' THEN d.sid END) exposures,COUNT(DISTINCT CASE WHEN d.kind='click' THEN d.sid END) clicks,SUM(CASE WHEN d.kind='click' THEN d.count ELSE 0 END) total_clicks"+base+" AND d.kind IN ('impression','click') GROUP BY d.path,d.module ORDER BY total_clicks DESC LIMIT 100",
    "SELECT d.path,d.action,d.module,COUNT(DISTINCT d.sid) sessions,SUM(d.count) clicks"+base+" AND d.kind='click' GROUP BY d.path,d.action,d.module ORDER BY clicks DESC LIMIT 100",
    "SELECT COUNT(DISTINCT s.id) entered,COUNT(DISTINCT CASE WHEN s.product_at<=? THEN s.id END) product,COUNT(DISTINCT CASE WHEN s.product_contact_at<=? THEN s.id END) contact,COUNT(DISTINCT CASE WHEN s.funnel_success_at<=? THEN s.id END) success"+base+" AND s.started_at BETWEEN ? AND ?",
  ];
  const statements=queries.map((sql,index)=>({sql,args:index===6?[range.end,range.end,range.end,...args,range.start,range.end]:args}));
  const results=await database().batch(statements,"read");
  const previousDays=(range.end-range.start+1)/86400000;
  const previous=new URLSearchParams(params);previous.set("from",new Date(range.start+8*3600000-previousDays*86400000).toISOString().slice(0,10));previous.set("to",new Date(range.start+8*3600000-86400000).toISOString().slice(0,10));
  const previousArgs=[previous.get('from')!,previous.get('to')!,...args.slice(2)];
  // Product cohort bounds also belong to the comparison period.
  if(product){previousArgs[previousArgs.length-2]=previous.get('from')!;previousArgs[previousArgs.length-1]=previous.get('to')!;}
  const comparison=await database().execute({sql:queries[0],args:previousArgs});
  return {range,updatedAt:new Date().toISOString(),timezone:"Asia/Shanghai",retention:{events:90,summary:365},totals:results[0].rows[0],previous:comparison.rows[0],trend:results[1].rows,channels:results[2].rows,pages:results[3].rows,modules:results[4].rows,actions:results[5].rows,funnel:results[6].rows[0],labels:{modules:MODULES,channels:CHANNELS}};
}
