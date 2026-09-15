import { getDb } from "@/lib/db";
import { NextResponse } from "next/server";
import { getSession, requireRole } from "@/lib/auth";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const skill = searchParams.get("skill");
  const area = searchParams.get("area");
  const mine = searchParams.get("mine");

  const filters = [];
  const values = [];

  if (mine) {
    const { session, response } = await requireRole("thekedar");
    if (response) {
      return response;
    }
    filters.push("thekedar_phone = ?");
    values.push(session.phone);
  } else {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Login chahiye" }, { status: 401 });
    }
    filters.push("status = 'open'");
  }

  if (skill) {
    filters.push("skill = ?");
    values.push(skill);
  }
  if (area && area.trim()) {
    filters.push("area LIKE ?");
    values.push("%" + area.trim() + "%");
  }

  const where = filters.length ? " WHERE " + filters.join(" AND ") : "";
  const db = await getDb();
  const [rows] = await db.query(
    "SELECT id, skill, worker_count, area, thekedar_phone, thekedar_name, status FROM jobs" +
      where +
      " ORDER BY (status = 'open') DESC, created_at DESC LIMIT 50",
    values
  );
  await db.end();
  return NextResponse.json(rows);
}

export async function POST(request) {
  const { session, response } = await requireRole("thekedar");
  if (response) {
    return response;
  }

  const body = await request.json();
  const skill = body.skill;
  const area = body.area || "";
  const name = (body.name || "").trim();
  const workerCount = Number(body.workerCount);

  if (!skill || !area.trim() || !name) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  if (!Number.isInteger(workerCount) || workerCount < 1) {
    return NextResponse.json({ error: "Invalid count" }, { status: 400 });
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

  await db.query(
    "INSERT INTO jobs (skill, worker_count, area, thekedar_phone, thekedar_name, status) VALUES (?, ?, ?, ?, ?, 'open')",
    [skill, workerCount, area.trim(), session.phone, name]
  );
  await db.end();
  return NextResponse.json({ ok: true });
}

export async function PATCH(request) {
  const { session, response } = await requireRole("thekedar");
  if (response) {
    return response;
  }

  const body = await request.json();
  const id = Number(body.id);
  const status = body.status;

  if (!id || status !== "closed") {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const db = await getDb();
  const [result] = await db.query(
    "UPDATE jobs SET status = ? WHERE id = ? AND thekedar_phone = ?",
    [status, id, session.phone]
  );
  await db.end();

  if (!result.affectedRows) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
