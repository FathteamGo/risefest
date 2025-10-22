import { NextRequest, NextResponse } from "next/server";

const WA_URL = process.env.WA_API_URL!;
const WA_KEY = process.env.WA_API_KEY!;
const WA_SENDER = process.env.WA_SENDER!;

export async function POST(req: NextRequest) {
  try {
    const { to, message } = await req.json();
    const res = await fetch(WA_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": WA_KEY },
      body: JSON.stringify({ sender: WA_SENDER, to, message }),
    });
    const data = await res.json().catch(() => ({}));
    return NextResponse.json({ ok: res.ok, data });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "wa-error" }, { status: 500 });
  }
}