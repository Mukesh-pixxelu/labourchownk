import { getDb } from "@/lib/db";
import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { todayIST } from "@/lib/ist";

export async function GET() {
  const labour = await requireRole("labour");
  if (!labour.response) {
    const db = await getDb();
    const [rows] = await db.query(
      `SELECT ji.job_id, ji.selected, j.skill, j.area, j.worker_count,
              j.thekedar_phone, j.thekedar_name, j.status
       FROM job_interests ji
       JOIN jobs j ON j.id = ji.job_id
       WHERE ji.worker_phone = ?
       ORDER BY ji.selected DESC, ji.created_at DESC`,
      [labour.session.phone]
    );
    await db.end();
    return NextResponse.json(rows);
  }

  const thekedar = await requireRole("thekedar");
  if (thekedar.response) {
    return thekedar.response;
  }

  const db = await getDb();
  const [rows] = await db.query(
    `SELECT ji.job_id, ji.selected, w.name, w.skill, w.phone, w.area
     FROM job_interests ji
     JOIN jobs j ON j.id = ji.job_id
     JOIN workers w ON w.phone = ji.worker_phone
     WHERE j.thekedar_phone = ?
     ORDER BY ji.selected DESC, ji.created_at DESC`,
    [thekedar.session.phone]
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
  const jobId = Number(body.jobId);
  const name = body.name;
  const skill = body.skill;
  const area = body.area || "";
  const phone = session.phone;

  if (!jobId || !name || !skill || !area.trim()) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const db = await getDb();
  const [jobs] = await db.query(
    "SELECT id, status FROM jobs WHERE id = ?",
    [jobId]
  );
  if (!jobs.length) {
    await db.end();
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }
  if (jobs[0].status !== "open") {
    await db.end();
    return NextResponse.json({ error: "Job closed" }, { status: 400 });
  }

  const [existingWorker] = await db.query(
    "SELECT id FROM workers WHERE phone = ?",
    [phone]
  );

  if (existingWorker.length) {
    await db.query(
      "UPDATE workers SET name = ?, skill = ?, area = ? WHERE phone = ?",
      [name, skill, area.trim(), phone]
    );
  } else {
    await db.query(
      "INSERT INTO workers (name, skill, phone, area, available, available_date) VALUES (?, ?, ?, ?, 1, ?)",
      [name, skill, phone, area.trim(), todayIST()]
    );
  }

  const [existing] = await db.query(
    "SELECT id FROM job_interests WHERE job_id = ? AND worker_phone = ?",
    [jobId, phone]
  );

  if (!existing.length) {
    await db.query(
      "INSERT INTO job_interests (job_id, worker_phone, selected) VALUES (?, ?, 0)",
      [jobId, phone]
    );
  }

  await db.end();
  return NextResponse.json({ ok: true });
}

export async function PATCH(request) {
  const { session, response } = await requireRole("thekedar");
  if (response) {
    return response;
  }

  const body = await request.json();
  const jobId = Number(body.jobId);
  const workerPhone = String(body.phone || "");

  if (!jobId || !/^\d{10}$/.test(workerPhone)) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const db = await getDb();
  const [jobs] = await db.query(
    "SELECT id, status, worker_count FROM jobs WHERE id = ? AND thekedar_phone = ?",
    [jobId, session.phone]
  );
  if (!jobs.length) {
    await db.end();
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }
  if (jobs[0].status !== "open") {
    await db.end();
    return NextResponse.json({ error: "Job closed" }, { status: 400 });
  }

  const [interest] = await db.query(
    "SELECT id, selected FROM job_interests WHERE job_id = ? AND worker_phone = ?",
    [jobId, workerPhone]
  );
  if (!interest.length) {
    await db.end();
    return NextResponse.json({ error: "Interest not found" }, { status: 404 });
  }

  if (Number(interest[0].selected) !== 1) {
    const [taken] = await db.query(
      "SELECT COUNT(*) AS n FROM job_interests WHERE job_id = ? AND selected = 1",
      [jobId]
    );
    if (Number(taken[0].n) >= Number(jobs[0].worker_count)) {
      await db.end();
      return NextResponse.json({ error: "Job full" }, { status: 400 });
    }

    await db.query(
      "UPDATE job_interests SET selected = 1 WHERE id = ?",
      [interest[0].id]
    );
    await db.query(
      "UPDATE workers SET available = 0, available_date = NULL WHERE phone = ?",
      [workerPhone]
    );
  }

  const [takenNow] = await db.query(
    "SELECT COUNT(*) AS n FROM job_interests WHERE job_id = ? AND selected = 1",
    [jobId]
  );
  const closed = Number(takenNow[0].n) >= Number(jobs[0].worker_count);
  if (closed) {
    await db.query(
      "UPDATE jobs SET status = 'closed' WHERE id = ? AND thekedar_phone = ?",
      [jobId, session.phone]
    );
  }

  await db.end();
  return NextResponse.json({ ok: true, closed });
}
