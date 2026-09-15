import { NextResponse } from "next/server";
import { setSession } from "@/lib/auth";

export async function POST(request) {
  const body = await request.json();
  const phone = String(body.phone || "");
  const otp = String(body.otp || "");
  const role = body.role;

  if (!/^\d{10}$/.test(phone) || (role !== "labour" && role !== "thekedar")) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  if (otp !== "123456") {
    return NextResponse.json({ error: "OTP galat. Test OTP: 123456" }, { status: 401 });
  }

  await setSession(phone, role);
  return NextResponse.json({ ok: true });
}
