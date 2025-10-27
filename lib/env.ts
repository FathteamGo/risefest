export const bool = (v: any, def = false) =>
  typeof v === "string"
    ? ["1", "true", "yes", "on"].includes(v.toLowerCase())
    : v ?? def;

export const ENV = {
  // client-side
  PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL || "https://risefest.fathforce.com",
  PUBLIC_API_BASE_URL:
    process.env.NEXT_PUBLIC_API_BASE_URL || "https://cmsmj.fathforce.com/api",
  PUBLIC_API_KEY: process.env.NEXT_PUBLIC_API_KEY || "",
  PUBLIC_PAYMENT_MODE: process.env.NEXT_PUBLIC_PAYMENT_MODE || "mock",
  PUBLIC_MIDTRANS_CLIENT_KEY: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || "",
  PUBLIC_FACEBOOK_PIXEL_ID: process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID || "",
  PUBLIC_GOOGLE_ANALYTICS_ID: process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID || "",

  // server-side
  MIDTRANS_SERVER_KEY: process.env.MIDTRANS_SERVER_KEY || "",
  MIDTRANS_IS_PRODUCTION: bool(process.env.MIDTRANS_IS_PRODUCTION, false),
};