export const MODULES: Record<string, string> = {
  film: "首页产品视频", navigation: "顶部导航", footer: "页脚", hero: "首页首屏", values: "首页核心能力",
  products: "首页产品展示", assessment: "首页报告视图", cases: "首页案例",
  solutions: "首页解决方案", workflow: "首页工作流程", consultation: "首页咨询",
  services: "首页服务", faq: "常见问题", final_cta: "页尾咨询",
  product_hero: "产品首屏", product_capabilities: "产品能力", product_story: "产品场景",
  product_specs: "产品规格", product_reports: "产品报告", downloads: "资料下载",
  product_cta: "产品咨询", editorial_hero: "栏目首屏", editorial_body: "栏目正文",
  related_products: "关联产品", editorial_cta: "栏目咨询", catalog: "产品总览",
  article_list: "文章列表", solution_list: "解决方案列表", contact_form: "询盘表单",
  page: "其他页面区域",
};
export const CHANNELS: Record<string,string> = { search:"自然搜索", social:"社交媒体", referral:"外部推荐", campaign:"推广活动", direct:"直接 / 未知" };
export const ACTIONS = ["navigate", "consultation", "download", "video_play", "email", "social", "external"] as const;
export const PUBLIC_KINDS = ["pageview", "impression", "click"] as const;
export type AnalyticsEvent = { id: string; kind: "pageview" | "impression" | "click" | "inquiry"; path: string; module: string; action: string };
export const UUID = /^[a-f0-9]{8}-[a-f0-9]{4}-[1-5][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;
export const SLUG = /^[a-z0-9][a-z0-9_-]{0,79}$/i;
export function campaignValue(value: unknown): string { return typeof value === "string" && SLUG.test(value) ? value.toLowerCase() : ""; }
export function attribution(input: { source?: unknown; medium?: unknown; campaign?: unknown; referrer?: unknown }, origin: string) {
  const source=campaignValue(input.source), medium=campaignValue(input.medium), campaign=campaignValue(input.campaign);
  if (source) return { channel: "campaign", source, medium, campaign };
  let host="";
  try { const url=new URL(String(input.referrer||"")); if(url.protocol==="https:"||url.protocol==="http:")host=url.hostname.toLowerCase(); } catch {}
  if (!host || host===new URL(origin).hostname || host.endsWith(".nexbodyfit.com")) return {channel:"direct",source:"direct",medium:"",campaign:""};
  const matches=(domains:string[])=>domains.some(domain=>host===domain||host.endsWith("."+domain));
  if(matches(["google.com","google.co.uk","google.com.hk","google.com.au","google.de","bing.com","baidu.com","yahoo.com","duckduckgo.com"]) || /^www\.google\.[a-z.]+$/.test(host))return {channel:"search",source:host.replace(/^www\./,""),medium:"organic",campaign:""};
  if(matches(["instagram.com","facebook.com","linkedin.com","t.co","twitter.com","x.com","youtube.com"]))return {channel:"social",source:host.replace(/^(www|l|m|lm)\./,""),medium:"social",campaign:""};
  return {channel:"referral",source:host.slice(0,120),medium:"referral",campaign:""};
}
export function dayAt(time=Date.now()) { return new Date(time+8*3600000).toISOString().slice(0,10); }
export function dateRange(params: URLSearchParams) {
  const to=params.get("to")||dayAt(); const from=params.get("from")||dayAt(Date.now()-6*86400000);
  const valid=(day:string)=>/^\d{4}-\d{2}-\d{2}$/.test(day)&&Number.isFinite(Date.parse(day))&&new Date(day).toISOString().slice(0,10)===day;
  if(!valid(from)||!valid(to)||from>to||to>dayAt()||(Date.parse(to)-Date.parse(from))/86400000>365)throw Error("请选择一年内的有效日期范围，结束日期不能晚于今天");
  return {from,to,start:Date.parse(from+"T00:00:00+08:00"),end:Date.parse(to+"T23:59:59.999+08:00")};
}
