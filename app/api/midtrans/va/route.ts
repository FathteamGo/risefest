import { NextRequest, NextResponse } from "next/server";
import { ENV } from "@/lib/env";

export const runtime = "nodejs";

const API = ENV.MIDTRANS_IS_PRODUCTION
  ? "https://api.midtrans.com"
  : "https://api.sandbox.midtrans.com";

const isMock =
  (ENV.PUBLIC_PAYMENT_MODE || "").toLowerCase() === "mock" ||
  !ENV.MIDTRANS_SERVER_KEY;

type Bank = "bca" | "bni" | "bri" | "permata" | "mandiri" | "cimb" | "danamon";

function mapBank(key: string): Bank {
  const k = (key || "").toLowerCase();
  if (k.includes("bri")) return "bri";
  if (k.includes("mandiri")) return "mandiri";
  if (k.includes("permata")) return "permata";
  if (k.includes("cimb")) return "cimb";
  if (k.includes("danamon")) return "danamon";
  if (k.includes("bsi") || k.includes("bjb")) return "permata"; // simulate
  return "bca";
}

export async function POST(req: NextRequest) {
  try {
    const { order_id, gross_amount, bank_key, customer } = await req.json();
    const bank = mapBank(bank_key);

    // MOCK
    if (isMock) {
      const rand = Math.floor(100000000 + Math.random() * 900000000)
        .toString()
        .slice(0, 10);
      const va = (bank === "permata" ? "77777" : "99999") + rand;

      // use public base url so links work even behind proxy
      const paymentUrl = `${ENV.PUBLIC_BASE_URL}/mock-payment/${order_id}`;

      return NextResponse.json({
        ok: true,
        transaction: {
          id: order_id,
          total_amount: gross_amount,
          va_number: va,
          va_bank: bank,
          payment_url: paymentUrl,
        },
        mock: true,
      });
    }

    // REAL
    const payload = {
      payment_type: "bank_transfer",
      transaction_details: {
        order_id,
        gross_amount: Number(gross_amount || 0),
      },
      bank_transfer: { bank },
      customer_details: customer || undefined,
    };

    const res = await fetch(`${API}/v2/charge`, {
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

    let data: any;
    try {
      data = await res.json();
    } catch {
      data = { raw: await res.text() };
    }

    if (!res.ok || (data.status_code && Number(data.status_code) >= 400)) {
      return NextResponse.json({ ok: false, error: data }, { status: 400 });
    }

    const va =
      data.va_numbers?.[0] ||
      (data.permata_va_number
        ? { va_number: data.permata_va_number, bank: "permata" }
        : null);

    return NextResponse.json({
      ok: true,
      transaction: {
        id: order_id,
        total_amount: gross_amount,
        va_number: va?.va_number || null,
        va_bank:
          va?.bank || (data.payment_type === "echannel" ? "mandiri" : null),
        payment_url: data.redirect_url || null,
      },
      raw: data,
    });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "error" },
      { status: 500 }
    );
  }
}