import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const WA_API_URL = process.env.WA_API_URL;
const WA_API_KEY = process.env.WA_API_KEY;
const WA_SENDER  = process.env.WA_SENDER;

function toWa(raw: string) {
  let s = String(raw || "").replace(/\D/g, "");
  if (!s) return s;
  if (s.startsWith("0")) s = "62" + s.slice(1);
  if (s.startsWith("8")) s = "62" + s;
  return s;
}

export async function POST(req: NextRequest) {
  try {
    // Log environment variables for debugging (remove in production)
    console.log('WA Environment Variables:', {
      WA_API_URL: WA_API_URL ? 'SET' : 'MISSING',
      WA_API_KEY: WA_API_KEY ? 'SET' : 'MISSING',
      WA_SENDER: WA_SENDER ? 'SET' : 'MISSING'
    });

    if (!WA_API_URL || !WA_API_KEY || !WA_SENDER) {
      console.error('WhatsApp API environment variables are missing');
      return NextResponse.json({ ok: false, error: "WA env missing" }, { status: 500 });
    }
    
    const body = await req.json().catch(() => ({}));
    console.log('WhatsApp notification request body:', body);
    
    const number = toWa(body?.to || body?.number || "");
    const message = String(body?.message || "");

    if (!number) {
      console.error('WhatsApp notification failed: recipient number is required');
      return NextResponse.json({ ok: false, error: "to is required" }, { status: 400 });
    }
    
    if (!message) {
      console.error('WhatsApp notification failed: message is required');
      return NextResponse.json({ ok: false, error: "message is required" }, { status: 400 });
    }

    const res = await fetch(WA_API_URL, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        api_key: WA_API_KEY,
        sender: WA_SENDER,
        number,
        message,
      }),
    });

    const data = await res.json().catch(async () => {
      const text = await res.text();
      console.log('WhatsApp API raw response:', text);
      return { raw: text };
    });
    
    console.log('WhatsApp API response:', {
      status: res.status,
      ok: res.ok,
      data
    });
    
    if (!res.ok) {
      console.error('WhatsApp API error:', {
        status: res.status,
        statusText: res.statusText,
        data
      });
      return NextResponse.json({ ok: false, error: data?.error || data || 'WhatsApp API error' }, { status: res.status });
    }
    
    console.log('WhatsApp notification sent successfully');
    return NextResponse.json({ ok: true, data });
  } catch (e: any) {
    console.error('WhatsApp notification failed with exception:', e);
    return NextResponse.json({ ok: false, error: e?.message || "error" }, { status: 500 });
  }
}