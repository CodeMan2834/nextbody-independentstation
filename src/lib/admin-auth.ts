import { randomBytes, timingSafeEqual } from "node:crypto";

export const STATE_COOKIE = "nexbody-cms-oauth";
export function adminSettings(env: NodeJS.ProcessEnv = process.env) {
  const repo = env.CMS_GITHUB_REPO || "CodeMan2834/nextbody-independentstation";
  const branch = env.CMS_GITHUB_BRANCH || "main";
  const rawOrigin = env.CMS_SITE_URL || env.NEXT_PUBLIC_SITE_URL || "https://nexbodyfit.com";
  let origin = "";
  try { const url = new URL(rawOrigin); if (url.protocol === "https:" && !url.username && !url.password && url.pathname === "/" && !url.search && !url.hash) origin = url.origin; } catch {}
  const ready = env.CMS_AUTH_MODE === "github" && !!env.CMS_GITHUB_CLIENT_ID && !!env.CMS_GITHUB_CLIENT_SECRET && !!origin && /^[\w.-]+\/[\w.-]+$/.test(repo) && /^[\w./-]+$/.test(branch);
  return { repo, branch, origin, ready, clientId: env.CMS_GITHUB_CLIENT_ID || "", clientSecret: env.CMS_GITHUB_CLIENT_SECRET || "" };
}
export function localEditingAllowed(url: URL, env: NodeJS.ProcessEnv = process.env) {
  return env.NODE_ENV === "development" && ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
}
export function validState(cookie: string | undefined, received: string | null) {
  if (!cookie || !received || !/^[a-f0-9]{64}$/.test(cookie) || !/^[a-f0-9]{64}$/.test(received)) return false;
  return timingSafeEqual(Buffer.from(cookie), Buffer.from(received));
}
export function newState() { return randomBytes(32).toString("hex"); }
export function popupHTML(origin: string, result: { token: string; provider: string } | { message: string }) {
  const nonce = randomBytes(18).toString("base64");
  const js = (value: unknown) => JSON.stringify(value).replace(/</g, "\\u003c");
  const status = "token" in result ? "success" : "error";
  const message = `authorization:github:${status}:${JSON.stringify(result)}`;
  return { nonce, html: `<!doctype html><html lang="zh-CN"><meta charset="utf-8"><title>NEXBODY 授权</title><body><p>${status === "success" ? "授权完成，请返回内容管理窗口。" : "授权未完成，请返回后台重试或联系管理员。"}</p><script nonce="${nonce}">const origin=${js(origin)};const openerWindow=window.opener;if(openerWindow){window.addEventListener('message',function handshake(event){if(event.source!==openerWindow||event.origin!==origin||event.data!=='authorizing:github')return;window.removeEventListener('message',handshake);openerWindow.postMessage(${js(message)},origin);});openerWindow.postMessage('authorizing:github',origin);}</script></body></html>` };
}
