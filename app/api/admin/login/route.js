import { NextResponse } from "next/server";
import { setSession } from "@/lib/auth";

export async function POST(request) {
  const body = await request.json();
  const user = String(body.user || "").trim();
  const password = String(body.password || "");
  const adminUser = process.env.ADMIN_USER || "";
  const adminPassword = process.env.ADMIN_PASSWORD || "";

  if (!adminUser || !adminPassword) {
    return NextResponse.json(
      { error: "Admin setup pending" },
      { status: 500 }
    );
  }

  if (user !== adminUser || password !== adminPassword) {
    return NextResponse.json({ error: "Login galat hai" }, { status: 401 });
  }

  await setSession(adminUser, "admin");
  return NextResponse.json({ ok: true });
}
