import { NextRequest, NextResponse } from "next/server";
import { authorised, ADMIN_COOKIE } from "@/lib/analytics/session";
import { analyticsSettings } from "@/lib/analytics/config";
import { localEditingAllowed } from "@/lib/admin-auth";
import { CloudflareError, cloudflareReport, cloudflareSettings, healthRange } from "@/lib/analytics/cloudflare";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export async function GET(request: NextRequest) {
  const headers = { "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow" };
  const local = localEditingAllowed(new URL(request.url));
  if (!local && !await authorised(request.cookies.get(ADMIN_COOKIE)?.value)) return NextResponse.json({ state: "unauthorised", loginReady: analyticsSettings().sessionReady, message: "请使用拥有网站仓库写权限的 GitHub 账号登录。" }, { status: 401, headers });
  let range;
  try { range = healthRange(request.nextUrl.searchParams); } catch { return NextResponse.json({ state: "error", message: "时间范围无效，请选择最近 24 小时、7 天或 30 天。" }, { status: 400, headers }); }
  if (!cloudflareSettings().ready) return NextResponse.json({ state: "unconfigured", message: "Cloudflare 数据尚未接入，请联系技术负责人配置分析只读授权及域名 Zone ID。现有网站交互统计可继续使用。" }, { headers });
  try { return NextResponse.json({ state: "ready", ...await cloudflareReport(range) }, { headers }); }
  catch (error) {
    return NextResponse.json({ state: error instanceof CloudflareError ? error.code : "error", message: error instanceof CloudflareError ? error.message : "Cloudflare 数据读取失败，请稍后重试。此状态不代表请求量为零。" }, { status: error instanceof CloudflareError && error.code === "limited" ? 422 : 503, headers });
  }
}
