import { getDb } from "@/lib/db";
import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";

export async function GET() {
  const { session, response } = await requireRole("thekedar");
  if (response) {
    return response;
  }

  const db = await getDb();
  const [rows] = await db.query(
    "SELECT id, name, phone FROM thekedars WHERE phone = ?",
    [session.phone]
  );
  await db.end();
  return NextResponse.json(rows[0] || null);
}

export async function POST(request) {
  const { session, response } = await requireRole("thekedar");
  if (response) {
    return response;
  }

  const body = await request.json();
  const name = (body.name || "").trim();
  if (!name) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const db = await getDb();
  const [existing] = await db.query(
    "SELECT id FROM thekedars WHERE phone = ?",
    [session.phone]
  );

  if (existing.length) {
    await db.query("UPDATE thekedars SET name = ? WHERE phone = ?", [
      name,
      session.phone,
    ]);
  } else {
    await db.query("INSERT INTO thekedars (name, phone) VALUES (?, ?)", [
      name,
      session.phone,
    ]);
  }

  await db.end();
  return NextResponse.json({ ok: true });
}
