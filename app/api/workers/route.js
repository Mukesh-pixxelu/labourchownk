import { getDb } from "@/lib/db";
import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { dateStamp, todayIST } from "@/lib/ist";
import { ensureWorkerColumns } from "@/lib/worker-photo";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const self = searchParams.get("self");
  const today = todayIST();

  if (self) {
    const { session, response } = await requireRole("labour");
    if (response) {
      return response;
    }

    const db = await getDb();
    await ensureWorkerColumns(db);
    const [rows] = await db.query(
      "SELECT id, name, skill, phone, area, available, available_date, photo, blocked FROM workers WHERE phone = ?",
      [session.phone]
    );
    const row = rows[0] || null;
    if (row && Number(row.available) === 1 && dateStamp(row.available_date) !== today) {
      await db.query(
        "UPDATE workers SET available = 0, available_date = NULL WHERE phone = ?",
        [session.phone]
      );
      row.available = 0;
      row.available_date = null;
    }
    await db.end();
    if (row) {
      delete row.available_date;
    }
    return NextResponse.json(row);
  }

  const skill = searchParams.get("skill");
  const area = searchParams.get("area");
  const filters = ["available = 1", "available_date = ?", "blocked = 0"];
  const values = [today];

  if (skill) {
    filters.push("skill = ?");
    values.push(skill);
  }
  if (area && area.trim()) {
    filters.push("area LIKE ?");
    values.push("%" + area.trim() + "%");
  }

  const db = await getDb();
  await ensureWorkerColumns(db);
  const [rows] = await db.query(
    "SELECT id, name, skill, phone, area, available, photo FROM workers WHERE " +
      filters.join(" AND ") +
      " ORDER BY name",
    values
  );
  await db.end();
  return NextResponse.json(rows);
}

export async function POST(request) {
  const { session, response } = await requireRole("labour");
  if (response) {
    return response;
  }

  const body = await request.json();
  const name = body.name;
  const skill = body.skill;
  const area = body.area || "";
  const available = body.available ? 1 : 0;
  const phone = session.phone;
  const availableDate = available ? todayIST() : null;

  if (!name || !skill || !area) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const db = await getDb();
  await ensureWorkerColumns(db);
  const [existing] = await db.query(
    "SELECT id FROM workers WHERE phone = ?",
    [phone]
  );

  if (existing.length) {
    await db.query(
      "UPDATE workers SET name = ?, skill = ?, area = ?, available = ?, available_date = ? WHERE phone = ?",
      [name, skill, area, available, availableDate, phone]
    );
  } else {
    await db.query(
      "INSERT INTO workers (name, skill, phone, area, available, available_date, photo) VALUES (?, ?, ?, ?, ?, ?, NULL)",
      [name, skill, phone, area, available, availableDate]
    );
  }

  await db.end();
  return NextResponse.json({ ok: true });
}
