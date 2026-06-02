import { NextRequest, NextResponse } from "next/server";

/**
 * License activation endpoint.
 *
 * Validates a LemonSqueezy license key server-side so the validation logic and
 * any secrets never reach the browser. No database is required for the basic
 * paywall — LemonSqueezy license keys are self-contained.
 *
 * Optional Supabase integration (accounts, usage limits, team seats) can be
 * added later inside this handler without changing the client.
 *
 * Env:
 *   LEMONSQUEEZY_STORE_ID   (optional) restrict to your store
 *   EF_DEV_LICENSE          (optional) a magic key that unlocks Pro in local dev
 */

export const runtime = "nodejs";

const LS_VALIDATE_URL = "https://api.lemonsqueezy.com/v1/licenses/validate";

export async function POST(req: NextRequest) {
  let body: { licenseKey?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ valid: false, error: "Bad request." }, { status: 400 });
  }

  const licenseKey = typeof body.licenseKey === "string" ? body.licenseKey.trim() : "";
  if (!licenseKey || licenseKey.length > 200) {
    return NextResponse.json({ valid: false, error: "Invalid license key." }, { status: 400 });
  }

  // Local/dev escape hatch so the team can test Pro features without a real key.
  const devKey = process.env.EF_DEV_LICENSE;
  if (devKey && licenseKey === devKey) {
    return NextResponse.json({ valid: true });
  }

  try {
    const res = await fetch(LS_VALIDATE_URL, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ license_key: licenseKey }),
      cache: "no-store",
    });

    const data = (await res.json()) as {
      valid?: boolean;
      license_key?: { status?: string; store_id?: number };
      error?: string;
    };

    const storeId = process.env.LEMONSQUEEZY_STORE_ID;
    const storeOk =
      !storeId || String(data.license_key?.store_id ?? "") === String(storeId);

    const valid =
      data.valid === true &&
      storeOk &&
      data.license_key?.status !== "expired" &&
      data.license_key?.status !== "disabled";

    if (!valid) {
      return NextResponse.json(
        { valid: false, error: "Invalid or expired license key." },
        { status: 200 },
      );
    }

    return NextResponse.json({ valid: true });
  } catch {
    return NextResponse.json(
      { valid: false, error: "Activation service unavailable." },
      { status: 502 },
    );
  }
}
