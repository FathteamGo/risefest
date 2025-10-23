import { NextRequest, NextResponse } from "next/server";
import { ENV } from "@/lib/env";

export const runtime = "nodejs";

const API_BASE = ENV.MIDTRANS_IS_PRODUCTION
  ? "https://api.midtrans.com"
  : "https://api.sandbox.midtrans.com";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { order_id, gross_amount, customer } = body || {};

    if (!order_id) {
      return NextResponse.json({ ok: false, error: "order_id is required" }, { status: 400 });
    }
    if (!ENV.MIDTRANS_SERVER_KEY) {
      return NextResponse.json({ ok: false, error: "MIDTRANS_SERVER_KEY is missing" }, { status: 500 });
    }

    const enabled_payments = [
      "credit_card",
      "gopay",
      "qris",
      "bca_va",
      "bni_va",
      "bri_va",
      "permata_va",
      "other_va",
      "echannel",
      "cstore"
    ];

    const payload = {
      transaction_details: {
        order_id,
        gross_amount: Number(gross_amount || 0),
      },
      customer_details: customer || undefined,

      enabled_payments,

      credit_card: {
        secure: true,
      },

      expiry: { unit: "minutes", duration: 60 },
    };

    const res = await fetch(`${API_BASE}/snap/v1/transactions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: "Basic " + Buffer.from(ENV.MIDTRANS_SERVER_KEY + ":").toString("base64"),
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(async () => ({ raw: await res.text() }));
    if (!res.ok || !data?.token) {
      const msg =
        data?.status_message ||
        (Array.isArray(data?.error_messages) ? data.error_messages.join(", ") : "") ||
        JSON.stringify(data);
      return NextResponse.json({ ok: false, error: msg }, { status: res.status || 400 });
    }

    return NextResponse.json({
      ok: true,
      transaction: {
        id: order_id,
        total_amount: Number(gross_amount || 0),
        snap_token: data.token,
        payment_url: data.redirect_url ?? null,
      },
    });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "error" }, { status: 500 });
  }
}
