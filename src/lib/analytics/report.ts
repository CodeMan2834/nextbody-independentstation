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
 if(channel){clauses.push("d.channel=?");args.push(channel);}
 if(device){clauses.push("d.device=?");args.push(device);}
 if(product){clauses.push("d.path=?");args.push('/products/'+product);}
 const base=" FROM analytics_counts d WHERE "+clauses.join(" AND ");
 const totals="SELECT COALESCE(SUM(CASE WHEN kind='pageview' THEN count ELSE 0 END),0) pageviews,COALESCE(SUM(CASE WHEN kind='click' THEN count ELSE 0 END),0) clicks,COALESCE(SUM(CASE WHEN kind='click' AND action='consultation' THEN count ELSE 0 END),0) consultations,COALESCE(SUM(CASE WHEN kind='inquiry' THEN count ELSE 0 END),0) inquiries";
 const queries=[totals+base,
 "SELECT day,SUM(CASE WHEN kind='pageview' THEN count ELSE 0 END) pageviews"+base+" GROUP BY day ORDER BY day",
 "SELECT channel,source,campaign,SUM(CASE WHEN kind='pageview' THEN count ELSE 0 END) pageviews,SUM(CASE WHEN kind='click' THEN count ELSE 0 END) clicks"+base+" AND kind IN ('pageview','click') GROUP BY channel,source,campaign ORDER BY pageviews DESC LIMIT 100",
 "SELECT path,SUM(count) pageviews"+base+" AND kind='pageview' GROUP BY path ORDER BY pageviews DESC LIMIT 100",
 "SELECT path,module,SUM(CASE WHEN kind='impression' THEN count ELSE 0 END) exposures,SUM(CASE WHEN kind='click' THEN count ELSE 0 END) clicks"+base+" AND kind IN ('impression','click') GROUP BY path,module ORDER BY clicks DESC LIMIT 100",
 "SELECT path,module,action,SUM(count) clicks"+base+" AND kind='click' GROUP BY path,module,action ORDER BY clicks DESC LIMIT 100",
 "SELECT COALESCE(SUM(CASE WHEN kind='pageview' AND path LIKE '/products/%' THEN count ELSE 0 END),0) product,COALESCE(SUM(CASE WHEN kind='pageview' AND path='/contact' THEN count ELSE 0 END),0) contact,COALESCE(SUM(CASE WHEN kind='inquiry' THEN count ELSE 0 END),0) success"+base];
 const results=await database().batch(queries.map(sql=>({sql,args})),"read");
 const days=(range.end-range.start+1)/86400000;
 const comparison=await database().execute({sql:totals+base,args:[new Date(range.start+28800000-days*86400000).toISOString().slice(0,10),new Date(range.start+28800000-86400000).toISOString().slice(0,10),...args.slice(2)]});
 return {mode:"aggregate",range,updatedAt:new Date().toISOString(),timezone:"Asia/Shanghai",retention:{events:90,summary:365},totals:results[0].rows[0],previous:comparison.rows[0],trend:results[1].rows,channels:results[2].rows,pages:results[3].rows,modules:results[4].rows,actions:results[5].rows,funnel:results[6].rows[0],labels:{modules:MODULES,channels:CHANNELS}};
}
