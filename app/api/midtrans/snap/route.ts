import { NextRequest, NextResponse } from "next/server";
import { ENV } from "@/lib/env";

export const runtime = "nodejs";

const API = ENV.MIDTRANS_IS_PRODUCTION
  ? "https://api.midtrans.com"
  : "https://api.sandbox.midtrans.com";

const isMock =
  (ENV.PUBLIC_PAYMENT_MODE || "").toLowerCase() === "mock" ||
  !ENV.MIDTRANS_SERVER_KEY;

export async function POST(req: NextRequest) {
  try {
    const { order_id, gross_amount, customer, enabled_payments } =
      await req.json();

    // MOCK → don’t return snap_token, send user to local simulator
    if (isMock) {
      const paymentUrl = `${ENV.PUBLIC_BASE_URL}/mock-payment/${order_id}`;
      return NextResponse.json({
        ok: true,
        transaction: {
          id: order_id,
          total_amount: gross_amount,
          snap_token: null,
          payment_url: paymentUrl,
        },
        mock: true,
      });
    }

    // REAL
    const payload = {
      transaction_details: {
        order_id,
        gross_amount: Number(gross_amount || 0),
      },
      customer_details: customer || undefined,
      enabled_payments: enabled_payments || ["qris", "gopay"],
    };

    const res = await fetch(`${API}/snap/v1/transactions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization:
          "Basic " +
          Buffer.from(ENV.MIDTRANS_SERVER_KEY + ":").toString("base64"),
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      let errBody: any = {};
      try {
        errBody = await res.json();
      } catch {
        errBody = { raw: await res.text() };
      }
      return NextResponse.json({ ok: false, error: errBody }, { status: 400 });
    }

    const data = await res.json(); // { token, redirect_url }
    return NextResponse.json({
      ok: true,
      transaction: {
        id: order_id,
        total_amount: gross_amount,
        snap_token: data.token,
        payment_url: data.redirect_url,
      },
    });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "error" },
      { status: 500 }
    );
  }
}