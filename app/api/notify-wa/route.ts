import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const WA_API_URL = process.env.WA_API_URL!;
const WA_API_KEY = process.env.WA_API_KEY!;
const WA_SENDER  = process.env.WA_SENDER!;

function toWa(raw: string) {
  let s = String(raw || "").replace(/\D/g, "");
  if (!s) return s;
  if (s.startsWith("0")) s = "62" + s.slice(1);
  if (s.startsWith("8")) s = "62" + s;
  return s;
}

export async function POST(req: NextRequest) {
  try {
    if (!WA_API_URL || !WA_API_KEY || !WA_SENDER) {
      return NextResponse.json({ ok: false, error: "WA env missing" }, { status: 500 });
    }
    const body = await req.json().catch(() => ({}));
    const to = toWa(body?.to || body?.number || "");
    const message = String(body?.message || "");

    if (!to) return NextResponse.json({ ok: false, error: "to is required" }, { status: 400 });
    if (!message) return NextResponse.json({ ok: false, error: "message is required" }, { status: 400 });

    const res = await fetch(WA_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": WA_API_KEY },
      body: JSON.stringify({
        sender: WA_SENDER,
        to,
        message,
      }),
    });

    const data = await res.json().catch(async () => ({ raw: await res.text() }));
    if (!res.ok) {
      return NextResponse.json({ ok: false, error: data?.error || data }, { status: res.status });
    }
    return NextResponse.json({ ok: true, data });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "error" }, { status: 500 });
  }
}