import { NextRequest, NextResponse } from "next/server";
import { adminSettings } from "@/lib/admin-auth";
import { analyticsSettings } from "@/lib/analytics/config";
import { LOGIN_COOKIE } from "@/lib/analytics/session";
export async function GET(request:NextRequest){
 const origin=new URL(request.url).origin;
 if(origin!==adminSettings().origin||!analyticsSettings().sessionReady)return NextResponse.json({error:'访问分析登录尚未配置。请联系负责人配置 ADMIN_SESSION_SECRET。'},{status:503,headers:{'Cache-Control':'no-store'}});
 const response=NextResponse.redirect(new URL('/api/admin/auth?target=analytics',origin));
 response.cookies.set(LOGIN_COOKIE,'analytics',{path:'/api/admin',httpOnly:true,secure:true,sameSite:'lax',maxAge:600});return response;
}
