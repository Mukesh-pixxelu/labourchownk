import { getDb } from "@/lib/db";
import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { dateStamp, todayIST } from "@/lib/ist";
import { deleteWorkerPhotos, ensureWorkerColumns } from "@/lib/worker-photo";

export async function GET(request) {
  const { response } = await requireRole("admin");
  if (response) {
    return response;
  }

  const { searchParams } = new URL(request.url);
  const skill = searchParams.get("skill") || "";
  const q = (searchParams.get("q") || "").trim();
  const status = searchParams.get("status") || "all";
  const today = todayIST();

  const db = await getDb();
  await ensureWorkerColumns(db);

  const filters = ["1=1"];
  const values = [];
  if (skill) {
    filters.push("skill = ?");
    values.push(skill);
  }
  if (q) {
    filters.push("(name LIKE ? OR phone LIKE ? OR area LIKE ?)");
    values.push("%" + q + "%", "%" + q + "%", "%" + q + "%");
  }
  if (status === "live") {
    filters.push("available = 1 AND available_date = ? AND blocked = 0");
    values.push(today);
  } else if (status === "hidden") {
    filters.push("blocked = 1");
  } else if (status === "offline") {
    filters.push("blocked = 0 AND (available = 0 OR available_date IS NULL OR available_date <> ?)");
    values.push(today);
  }

  const [rows] = await db.query(
    "SELECT id, name, skill, phone, area, available, available_date, photo, blocked FROM workers WHERE " +
      filters.join(" AND ") +
      " ORDER BY id DESC",
    values
  );
  await db.end();

  const workers = rows.map((row) => {
    const live =
      Number(row.available) === 1 &&
      dateStamp(row.available_date) === today &&
      Number(row.blocked) !== 1;
    return {
      id: row.id,
      name: row.name,
      skill: row.skill,
      phone: row.phone,
      area: row.area,
      photo: row.photo,
      blocked: Number(row.blocked) === 1,
      available: Number(row.available) === 1,
      live,
    };
  });

  return NextResponse.json(workers);
}

export async function PATCH(request) {
  const { response } = await requireRole("admin");
  if (response) {
    return response;
  }

  const body = await request.json();
  const id = Number(body.id);
  if (!id) {
    return NextResponse.json({ error: "Worker id chahiye" }, { status: 400 });
  }

  const db = await getDb();
  await ensureWorkerColumns(db);
  const [rows] = await db.query(
    "SELECT id, available, blocked FROM workers WHERE id = ?",
    [id]
  );
  if (!rows.length) {
    await db.end();
    return NextResponse.json({ error: "Labour nahi mila" }, { status: 404 });
  }

  const nextBlocked =
    typeof body.blocked === "boolean" ? (body.blocked ? 1 : 0) : Number(rows[0].blocked);
  let nextAvailable =
    typeof body.available === "boolean" ? (body.available ? 1 : 0) : Number(rows[0].available);
  let availableDate = nextAvailable ? todayIST() : null;
  if (nextBlocked === 1) {
    nextAvailable = 0;
    availableDate = null;
  }

  await db.query(
    "UPDATE workers SET blocked = ?, available = ?, available_date = ? WHERE id = ?",
    [nextBlocked, nextAvailable, availableDate, id]
  );
  await db.end();
  return NextResponse.json({ ok: true });
}

export async function DELETE(request) {
  const { response } = await requireRole("admin");
  if (response) {
    return response;
  }

  const { searchParams } = new URL(request.url);
  const id = Number(searchParams.get("id"));
  if (!id) {
    return NextResponse.json({ error: "Worker id chahiye" }, { status: 400 });
  }

  const db = await getDb();
  await ensureWorkerColumns(db);
  const [rows] = await db.query("SELECT phone FROM workers WHERE id = ?", [id]);
  if (!rows.length) {
    await db.end();
    return NextResponse.json({ error: "Labour nahi mila" }, { status: 404 });
  }

  const phone = rows[0].phone;
  try {
    await db.query("DELETE FROM job_interests WHERE worker_phone = ?", [phone]);
  } catch {
    // table may not be used
  }
  await db.query("DELETE FROM workers WHERE id = ?", [id]);
  await db.end();
  await deleteWorkerPhotos(phone);
  return NextResponse.json({ ok: true });
}
