import { NextResponse } from "next/server";
import { adminSettings, newState, STATE_COOKIE } from "@/lib/admin-auth";
import { LOGIN_COOKIE } from "@/lib/analytics/session";
export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  const settings = adminSettings();
  if (!settings.ready || new URL(request.url).origin !== settings.origin) return NextResponse.json({ error: "后台授权未配置或访问域名不匹配" }, { status: 503, headers: { "Cache-Control": "no-store" } });
  const state = newState();
  const url = new URL("https://github.com/login/oauth/authorize");
  url.search = new URLSearchParams({ client_id: settings.clientId, redirect_uri: `${settings.origin}/api/admin/callback`, scope: "repo", state }).toString();
  const response = NextResponse.redirect(url);
  response.cookies.set(STATE_COOKIE, state, { httpOnly: true, secure: true, sameSite: "lax", maxAge: 600, path: "/api/admin" });
  response.cookies.set(LOGIN_COOKIE, new URL(request.url).searchParams.get("target") === "analytics" ? "analytics" : "", { path: "/api/admin", maxAge: new URL(request.url).searchParams.get("target") === "analytics" ? 600 : 0, httpOnly: true, secure: true, sameSite: "lax" });
  response.headers.set("Cache-Control", "no-store");
  return response;
}
