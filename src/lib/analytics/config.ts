export function analyticsSettings(env: NodeJS.ProcessEnv=process.env) {
  const url=env.TURSO_DATABASE_URL||"", token=env.TURSO_AUTH_TOKEN||"", secret=env.ADMIN_SESSION_SECRET||"";
  let database=false;
  try { const parsed=new URL(url); database=(!parsed.username&&!parsed.password&&!parsed.search&&!parsed.hash&&/\.turso\.io$/.test(parsed.hostname)&&["libsql:","https:"].includes(parsed.protocol)&&!!token) || (env.NODE_ENV!=="production"&&url.startsWith("file:")); } catch {}
  const enabled=env.VERCEL_ENV!=="preview"&&env.ANALYTICS_ENABLED==="true"&&database&&secret.length>=32;
  return {url,token,secret,database,enabled,sessionReady:secret.length>=32};
}
