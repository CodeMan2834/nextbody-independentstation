import { createCipheriv, createDecipheriv, createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { analyticsSettings } from "./config";
export const ADMIN_COOKIE="nexbody-analytics-admin";
export const VISIT_COOKIE="nexbody-analytics-visit";
export const LOGIN_COOKIE="nexbody-analytics-login";
export const ADMIN_TTL=8*3600;
function key(secret:string) { return createHash("sha256").update("nexbody-admin-session-v1:"+secret).digest(); }
export function sealAdmin(token:string,secret:string,now=Date.now()) {
  const iv=randomBytes(12), cipher=createCipheriv("aes-256-gcm",key(secret),iv);
  const encrypted=Buffer.concat([cipher.update(JSON.stringify({token,expires:now+ADMIN_TTL*1000}),"utf8"),cipher.final()]);
  return Buffer.concat([iv,cipher.getAuthTag(),encrypted]).toString("base64url");
}
export function openAdmin(value:string|undefined,secret:string,now=Date.now()):string|null {
  if(!value||secret.length<32||value.length>6000)return null;
  try {const bytes=Buffer.from(value,"base64url"), cipher=createDecipheriv("aes-256-gcm",key(secret),bytes.subarray(0,12));cipher.setAuthTag(bytes.subarray(12,28));const result=JSON.parse(Buffer.concat([cipher.update(bytes.subarray(28)),cipher.final()]).toString());return typeof result.token==="string"&&result.expires>now&&result.expires<=now+ADMIN_TTL*1000?result.token:null;}catch{return null;}
}
export function signVisit(id:string,secret:string,now=Date.now()) {
  const value=`${id}.${Math.floor(now/1000)+1800}`;
  return value+"."+createHmac("sha256",secret).update("visit:"+value).digest("base64url");
}
export function openVisit(cookie:string|undefined,secret:string,now=Date.now()) {
  if(!cookie||cookie.length>200)return null;
  const [id,expires,signature]=cookie.split(".");
  if(!/^[a-f0-9-]{36}$/i.test(id||"")||!/^\d+$/.test(expires||"")||Number(expires)*1000<=now||Number(expires)*1000>now+1800000)return null;
  const expected=createHmac("sha256",secret).update(`visit:${id}.${expires}`).digest("base64url");
  if(!signature||signature.length!==expected.length||!timingSafeEqual(Buffer.from(signature),Buffer.from(expected)))return null;
  return id;
}
const permissionCache=new Map<string,number>();
export async function authorised(cookie:string|undefined) {
  const settings=analyticsSettings(),token=openAdmin(cookie,settings.secret);
  if(!token)return false;
  const digest=createHash("sha256").update(token).digest("hex");
  if((permissionCache.get(digest)||0)>Date.now())return true;
  try {
    const repo=process.env.CMS_GITHUB_REPO||"CodeMan2834/nextbody-independentstation";
    if(!/^[\w.-]+\/[\w.-]+$/.test(repo))return false;
    const response=await fetch(`https://api.github.com/repos/${repo}`,{headers:{Authorization:`Bearer ${token}`,Accept:"application/vnd.github+json"},cache:"no-store",signal:AbortSignal.timeout(7000)});
    const value=await response.json();if(!response.ok||!value.permissions?.push)return false;
    if(permissionCache.size>200)permissionCache.clear();permissionCache.set(digest,Date.now()+300000);return true;
  }catch{return false;}
}
