import { NextRequest, NextResponse } from "next/server";
import { VISIT_COOKIE } from "@/lib/analytics/session";
export async function POST(request:NextRequest){
  if(request.headers.get('origin')!==new URL(request.url).origin)return new NextResponse(null,{status:403});
  const response=new NextResponse(null,{status:204,headers:{'Cache-Control':'no-store'}});
  response.cookies.set(VISIT_COOKIE,'',{maxAge:0,path:'/',httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax'});return response;
}
