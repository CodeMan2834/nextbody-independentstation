import { NextRequest, NextResponse } from "next/server";
import { authorised, ADMIN_COOKIE } from "@/lib/analytics/session";
import { analyticsSettings } from "@/lib/analytics/config";
import { localEditingAllowed } from "@/lib/admin-auth";
import { report, reportFilters } from "@/lib/analytics/report";
export const dynamic='force-dynamic';
export async function GET(request:NextRequest) {
  const headers={'Cache-Control':'no-store','X-Robots-Tag':'noindex, nofollow'};
  const settings=analyticsSettings();
  const local=localEditingAllowed(new URL(request.url));
  if(!local&&!await authorised(request.cookies.get(ADMIN_COOKIE)?.value))return NextResponse.json({state:'unauthorised',message:settings.sessionReady?'请使用拥有网站仓库写权限的 GitHub 账号登录。':'统计后台尚未启用，等待账号及服务端配置完成。当前没有开放统计数据访问。',loginReady:settings.sessionReady},{status:401,headers});
  if(!settings.database||!settings.enabled)return NextResponse.json({state:'unconfigured',message:'统计尚未接入。等待 Turso 账号就绪后配置数据库并启用采集；当前没有可展示的真实统计。',local},{headers});
  try {reportFilters(request.nextUrl.searchParams);}catch{return NextResponse.json({state:'error',message:'筛选条件无效。请检查日期、渠道、设备或产品；日期最多 366 天且不能晚于今天。'},{status:400,headers});}
  try{return NextResponse.json({state:'ready',local,data:await report(request.nextUrl.searchParams)},{headers});}
  catch{return NextResponse.json({state:'error',message:'统计读取失败，请检查数据库连接、初始化状态或筛选条件。网站浏览和询盘不受影响。'},{status:503,headers});}
}
