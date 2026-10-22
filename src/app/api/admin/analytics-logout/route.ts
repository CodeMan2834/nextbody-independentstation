import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE } from "@/lib/analytics/session";
export async function POST(request:NextRequest){
 if(request.headers.get('origin')!==new URL(request.url).origin)return new NextResponse(null,{status:403});
 const response=new NextResponse(null,{status:204,headers:{'Cache-Control':'no-store'}});
 response.cookies.set(ADMIN_COOKIE,'',{path:'/',httpOnly:true,secure:true,sameSite:'lax',maxAge:0});return response;
}
