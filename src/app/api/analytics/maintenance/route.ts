import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { cleanup } from "@/lib/analytics/db";
import { analyticsSettings } from "@/lib/analytics/config";
export const dynamic = "force-dynamic";
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET || "";
  const provided = request.headers.get("authorization") || "";
  const expected = `Bearer ${secret}`;
  const headers = { "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow" };
  if (secret.length < 32 || provided.length !== expected.length || !timingSafeEqual(Buffer.from(provided), Buffer.from(expected))) {
    return NextResponse.json({ error: "未授权" }, { status: 401, headers });
  }
  if (!analyticsSettings().enabled) return NextResponse.json({ state: "disabled" }, { headers });
  try {
    await cleanup();
    return NextResponse.json({ state: "complete" }, { headers });
  } catch {
    return NextResponse.json({ state: "error" }, { status: 503, headers });
  }
}
