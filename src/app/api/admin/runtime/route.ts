import { NextResponse } from "next/server";
import { adminSettings, localEditingAllowed } from "@/lib/admin-auth";
export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  const url = new URL(request.url);
  const local = localEditingAllowed(url);
  const settings = adminSettings();
  const enabled = local || (settings.ready && url.origin === settings.origin);
  const port = /^\d{2,5}$/.test(process.env.CMS_LOCAL_PORT || "") ? process.env.CMS_LOCAL_PORT : "8081";
  return NextResponse.json({
    enabled, mode: local ? "local" : "github",
    message: local ? "本地编辑：保存只写入本机工程，线上需提交并部署。" : enabled ? "线上编辑：使用有仓库写权限的 GitHub 账号；保存会提交内容，网站需等待部署成功。" : "线上后台尚未启用。请由技术负责人配置 GitHub OAuth 和自动部署后交付；此页面不会连接访问者的 localhost。",
    backend: enabled ? local ? { name: "proxy", proxy_url: `http://localhost:${port}/api/v1` } : { name: "github", repo: settings.repo, branch: settings.branch, base_url: settings.origin, auth_endpoint: "api/admin/auth" } : null,
  }, { headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow" } });
}
