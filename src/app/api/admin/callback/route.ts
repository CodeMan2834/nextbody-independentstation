import { NextRequest, NextResponse } from "next/server";
import { adminSettings, popupHTML, STATE_COOKIE, validState } from "@/lib/admin-auth";
export const dynamic = "force-dynamic";
export async function GET(request: NextRequest) {
  const settings = adminSettings();
  const reply = (result: { token: string; provider: string } | { message: string }, status = 200) => {
    const { nonce, html } = popupHTML(settings.origin, result);
    const response = new NextResponse(html, { status, headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store", "Referrer-Policy": "no-referrer", "X-Frame-Options": "DENY", "Content-Security-Policy": `default-src 'none'; script-src 'nonce-${nonce}'; base-uri 'none'; frame-ancestors 'none'` } });
    response.cookies.set(STATE_COOKIE, "", { path: "/api/admin", maxAge: 0, httpOnly: true, secure: true, sameSite: "lax" });
    return response;
  };
  if (!settings.ready || request.nextUrl.origin !== settings.origin) return reply({ message: "后台授权未配置或访问域名不匹配" }, 503);
  if (!validState(request.cookies.get(STATE_COOKIE)?.value, request.nextUrl.searchParams.get("state"))) return reply({ message: "授权会话已失效，请重新登录" }, 400);
  const code = request.nextUrl.searchParams.get("code");
  if (!code || request.nextUrl.searchParams.has("error")) return reply({ message: "GitHub 授权已取消" }, 400);
  try {
    const exchange = await fetch("https://github.com/login/oauth/access_token", { method: "POST", headers: { Accept: "application/json", "Content-Type": "application/json" }, body: JSON.stringify({ client_id: settings.clientId, client_secret: settings.clientSecret, code, redirect_uri: `${settings.origin}/api/admin/callback` }), signal: AbortSignal.timeout(15000), cache: "no-store" });
    const result = await exchange.json();
    if (!exchange.ok || typeof result.access_token !== "string" || !result.access_token) return reply({ message: "GitHub 授权失败，请重新登录" }, 401);
    const permission = await fetch(`https://api.github.com/repos/${settings.repo}`, { headers: { Authorization: `Bearer ${result.access_token}`, Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28" }, signal: AbortSignal.timeout(15000), cache: "no-store" });
    const repo = await permission.json();
    if (!permission.ok || !repo.permissions?.push) return reply({ message: "当前 GitHub 账号没有此网站仓库的写权限，请联系负责人" }, 403);
    return reply({ token: result.access_token, provider: "github" });
  } catch { return reply({ message: "授权服务暂时不可用，请稍后重试" }, 502); }
}
