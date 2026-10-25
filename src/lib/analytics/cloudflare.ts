import { createHash } from "node:crypto";

const ENDPOINT = "https://api.cloudflare.com/client/v4/graphql";
const TTL = 5 * 60_000;
export const HEALTH_RANGES = { "24h": 24 * 3600_000, "7d": 7 * 86400_000, "30d": 30 * 86400_000 };
export type HealthRange = keyof typeof HEALTH_RANGES;
type Row = { count: number; sum?: { edgeResponseBytes: number }; avg?: { sampleInterval: number }; dimensions?: Record<string, string | number> };
type Limits = { enabled: boolean; maxDuration: number; notOlderThan: number; maxPageSize: number };
export class CloudflareError extends Error {
  constructor(public code: "permission" | "limited" | "unavailable" | "response", message: string) { super(message); }
}
export function cloudflareSettings(env: NodeJS.ProcessEnv = process.env) {
  const token = env.CLOUDFLARE_ANALYTICS_TOKEN?.trim() || "";
  const zone = env.CLOUDFLARE_ZONE_ID?.trim() || "";
  let host = "nexbodyfit.com";
  try { host = new URL(env.CMS_SITE_URL || "https://nexbodyfit.com").hostname.replace(/^www\./, ""); } catch { /* Invalid site configuration does not authorize upstream requests. */ }
  return { token, zone, host, ready: !!token && /^[a-f0-9]{32}$/i.test(zone) };
}
export function healthRange(params: URLSearchParams): HealthRange {
  const value = params.get("range") || "24h";
  if (!Object.hasOwn(HEALTH_RANGES, value)) throw Error("请选择最近 24 小时、7 天或 30 天。");
  return value as HealthRange;
}
async function graphql(query: string, variables: Record<string, unknown>, token: string) {
  let response: Response;
  try {
    response = await fetch(ENDPOINT, { method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify({ query, variables }), cache: "no-store", signal: AbortSignal.timeout(12_000) });
  } catch { throw new CloudflareError("unavailable", "Cloudflare 请求超时或网络不可用，请稍后重试。"); }
  if (response.status === 401 || response.status === 403) throw new CloudflareError("permission", "Cloudflare 授权无效或权限不足，请检查分析读取权限、域名范围及 Token 有效期。");
  if (!response.ok) throw new CloudflareError("unavailable", response.status === 429 ? "Cloudflare 查询频率受限，请稍后重试。" : "Cloudflare 暂时无法提供数据，请稍后重试。");
  let result;
  try { result = await response.json(); } catch { throw new CloudflareError("response", "Cloudflare 返回的数据无法读取。"); }
  if (result.errors?.length) {
    const error = result.errors.map((e: { message?: string }) => e.message || "").join(" ");
    if (/authoriz|permission|access|authentication|token/i.test(error)) throw new CloudflareError("permission", "Cloudflare 授权不足或当前套餐不支持所需字段，请检查分析权限和数据集可用性。");
    if (/limit|duration|older|time range|too many|quota|budget/i.test(error)) throw new CloudflareError("limited", "当前查询超出 Cloudflare 套餐范围或查询额度，请缩短时间范围或稍后重试。");
    throw new CloudflareError("response", "Cloudflare 数据集或字段暂不可用，请联系技术人员核对接口权限与套餐。");
  }
  const zones = result.data?.viewer?.zones;
  if (!Array.isArray(zones) || zones.length !== 1 || !zones[0]) throw new CloudflareError("permission", "Cloudflare 未返回该域名的数据，请核对 Zone ID 和 Token 的域名授权范围。");
  return zones[0];
}
function rows(value: unknown): Row[] {
  if (!Array.isArray(value) || value.some(r => !r || typeof r.count !== "number" || !Number.isFinite(r.count) || r.count < 0)) throw new CloudflareError("response", "Cloudflare 返回了不完整的统计数据，请稍后重试。");
  return value;
}
const sumCount = (values: Row[]) => values.reduce((total, r) => total + r.count, 0);
export function normalizeHealth(zone: Record<string, unknown>, range: HealthRange, start: number, end: number, host: string) {
  const totals = rows(zone.totals), trend = rows(zone.trend), countries = rows(zone.countries), cache = rows(zone.cache), statuses = rows(zone.statuses);
  if (totals.length > 1 || totals.some(r => !Number.isFinite(r.sum?.edgeResponseBytes) || Number(r.sum?.edgeResponseBytes) < 0)) throw new CloudflareError("response", "Cloudflare 流量汇总不完整，请稍后重试。");
  if (trend.some(r => !Number.isFinite(Date.parse(String(r.dimensions?.[range === "24h" ? "datetimeHour" : "date"] || "")))) || countries.some(r => typeof r.dimensions?.clientCountryName !== "string") || cache.some(r => typeof r.dimensions?.cacheStatus !== "string")) throw new CloudflareError("response", "Cloudflare 分组数据不完整，请稍后重试。");
  const requests = sumCount(totals), bytes = totals.reduce((n, r) => n + Number(r.sum?.edgeResponseBytes || 0), 0);
  const statusRows = statuses.map(r => ({ status: Number(r.dimensions?.edgeResponseStatus), requests: r.count }));
  if (statusRows.some(r => !Number.isInteger(r.status) || r.status < 0 || r.status > 599)) throw new CloudflareError("response", "Cloudflare 状态码数据不完整。");
  const clientErrors = statusRows.filter(r => r.status >= 400 && r.status < 500).reduce((n, r) => n + r.requests, 0);
  const serverErrors = statusRows.filter(r => r.status >= 500).reduce((n, r) => n + r.requests, 0);
  const hits = sumCount(cache.filter(r => String(r.dimensions?.cacheStatus).toLowerCase() === "hit"));
  const completeStatuses = statuses.length < 100, completeCache = cache.length < 30;
  return {
    source: "cloudflare", dataset: "httpRequestsAdaptiveGroups", host, range,
    window: { start: new Date(start).toISOString(), end: new Date(end).toISOString() },
    fetchedAt: new Date(end).toISOString(), expiresAt: new Date(end + TTL).toISOString(),
    grain: range === "24h" ? "hour" : "day", timezone: "UTC",
    sampling: totals.some(r => Number(r.avg?.sampleInterval) > 1) ? "sampled" : "adaptive",
    totals: { requests, bytes, cacheHitRate: requests && completeCache ? hits / requests * 100 : null, serverErrorRate: requests && completeStatuses ? serverErrors / requests * 100 : null, clientErrors, serverErrors },
    trend: trend.map(r => ({ time: String(r.dimensions?.[range === "24h" ? "datetimeHour" : "date"] || ""), requests: r.count })),
    countries: countries.map(r => ({ country: String(r.dimensions?.clientCountryName || "XX"), requests: r.count })),
    cache: cache.map(r => ({ status: String(r.dimensions?.cacheStatus || "unknown"), requests: r.count })),
    statuses: statusRows,
    partial: !completeCache || !completeStatuses,
  };
}
type HealthData = ReturnType<typeof normalizeHealth>;
let signature = "";
let limits: { value: Limits; until: number } | undefined;
const cache = new Map<HealthRange, { data: HealthData; until: number }>();
const pending = new Map<HealthRange, Promise<HealthData>>();
export async function cloudflareReport(range: HealthRange, now = Date.now()) {
  const settings = cloudflareSettings();
  if (!settings.ready) throw new CloudflareError("permission", "Cloudflare 尚未配置。");
  const key = createHash("sha256").update(settings.zone + ":" + settings.token + ":" + settings.host).digest("hex");
  if (signature !== key) { cache.clear(); pending.clear(); limits = undefined; signature = key; }
  const saved = cache.get(range);
  if (saved && saved.until > now) return { data: saved.data, cached: true };
  const existing = pending.get(range);
  if (existing) return { data: await existing, cached: true };
  const job = (async () => {
    if (!limits || limits.until <= now) {
      const result = await graphql(`query HealthSettings { viewer { zones(filter: {zoneTag: ${JSON.stringify(settings.zone)}}) { settings { httpRequestsAdaptiveGroups { enabled maxDuration notOlderThan maxPageSize } } } } }`, {}, settings.token);
      const value = result.settings?.httpRequestsAdaptiveGroups;
      if (!value || value.enabled !== true) throw new CloudflareError("limited", "当前 Cloudflare 套餐或授权未开放 HTTP 流量数据集。");
      limits = { value, until: now + TTL };
    }
    const duration = HEALTH_RANGES[range];
    if ((limits.value.maxDuration > 0 && duration / 1000 > limits.value.maxDuration) || (limits.value.notOlderThan > 0 && duration / 1000 > limits.value.notOlderThan)) throw new CloudflareError("limited", "该时间范围超出当前 Cloudflare 套餐支持，请选择更短范围。");
    if (limits.value.maxPageSize > 0 && limits.value.maxPageSize < 100) throw new CloudflareError("limited", "当前数据集返回条数不足以完整展示健康指标，请联系技术人员调整查询。");
    const dimension = range === "24h" ? "datetimeHour" : "date";
    // Values are generated server-side and JSON-quoted as GraphQL string literals.
    // This avoids relying on Cloudflare's legacy/custom scalar variable names.
    const filter = `filter: {datetime_geq: ${JSON.stringify(new Date(now - duration).toISOString())}, datetime_lt: ${JSON.stringify(new Date(now).toISOString())}, requestSource: "eyeball", clientRequestHTTPHost_in: ${JSON.stringify([settings.host, "www." + settings.host])}}`;
    const node = "httpRequestsAdaptiveGroups";
    const query = `query WebsiteHealth {
      viewer { zones(filter: {zoneTag: ${JSON.stringify(settings.zone)}}) {
        totals: ${node}(limit: 1, ${filter}) { count sum { edgeResponseBytes } avg { sampleInterval } }
        trend: ${node}(limit: 100, orderBy: [${dimension}_ASC], ${filter}) { count dimensions { ${dimension} } }
        countries: ${node}(limit: 10, orderBy: [count_DESC], ${filter}) { count dimensions { clientCountryName } }
        cache: ${node}(limit: 30, orderBy: [count_DESC], ${filter}) { count dimensions { cacheStatus } }
        statuses: ${node}(limit: 100, orderBy: [count_DESC], ${filter}) { count dimensions { edgeResponseStatus } }
      } }
    }`;
    const result = await graphql(query, {}, settings.token);
    const data = normalizeHealth(result, range, now - duration, now, settings.host);
    // An old request must not replace the cache after credentials have changed.
    if (signature === key) cache.set(range, { data, until: now + TTL });
    return data;
  })();
  pending.set(range, job);
  try { return { data: await job, cached: false }; }
  finally { if (pending.get(range) === job) pending.delete(range); }
}
