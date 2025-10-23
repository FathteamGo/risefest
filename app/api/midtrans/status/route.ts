// app/api/midtrans/status/route.ts
import { NextRequest, NextResponse } from "next/server";
import { ENV } from "@/lib/env";

export const runtime = "nodejs";

const API_BASE = ENV.MIDTRANS_IS_PRODUCTION
  ? "https://api.midtrans.com"
  : "https://api.sandbox.midtrans.com";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const order_id = searchParams.get("order_id");
    if (!order_id) {
      return NextResponse.json({ ok: false, error: "order_id is required" }, { status: 400 });
    }
    if (!ENV.MIDTRANS_SERVER_KEY) {
      return NextResponse.json({ ok: false, error: "MIDTRANS_SERVER_KEY is missing" }, { status: 500 });
    }

    const res = await fetch(`${API_BASE}/v2/${encodeURIComponent(order_id)}/status`, {
      headers: {
        Accept: "application/json",
        Authorization: "Basic " + Buffer.from(ENV.MIDTRANS_SERVER_KEY + ":").toString("base64"),
      },
      cache: "no-store",
    });

    const data = await res.json().catch(async () => ({ raw: await res.text() }));
    if (!res.ok) {
      return NextResponse.json({ ok: false, error: data }, { status: res.status });
    }

    return NextResponse.json({ ok: true, data });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "error" }, { status: 500 });
  }
}
