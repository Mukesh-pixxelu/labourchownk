import { getDb } from "@/lib/db";
import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { SKILLS } from "@/lib/skills";
import { ensurePhotoColumn, saveWorkerPhoto } from "@/lib/worker-photo";

export async function POST(request) {
  const { session, response } = await requireRole("labour");
  if (response) {
    return response;
  }

  const form = await request.formData();
  const name = String(form.get("name") || "").trim();
  const skill = String(form.get("skill") || "").trim();
  const area = String(form.get("area") || "").trim();
  const photoFile = form.get("photo");

  if (!name || !skill || !area) {
    return NextResponse.json(
      { error: "Naam, profession aur area daalo" },
      { status: 400 }
    );
  }
  if (!SKILLS.includes(skill)) {
    return NextResponse.json({ error: "Profession galat hai" }, { status: 400 });
  }

  let photo = null;
  try {
    photo = await saveWorkerPhoto(session.phone, photoFile);
  } catch (err) {
    return NextResponse.json(
      { error: err.message || "Photo save nahi hui" },
      { status: 400 }
    );
  }

  const db = await getDb();
  await ensurePhotoColumn(db);

  const [existing] = await db.query(
    "SELECT id, photo FROM workers WHERE phone = ?",
    [session.phone]
  );

  if (existing.length) {
    if (photo) {
      await db.query(
        "UPDATE workers SET name = ?, skill = ?, area = ?, photo = ? WHERE phone = ?",
        [name, skill, area, photo, session.phone]
      );
    } else {
      await db.query(
        "UPDATE workers SET name = ?, skill = ?, area = ? WHERE phone = ?",
        [name, skill, area, session.phone]
      );
    }
  } else {
    await db.query(
      "INSERT INTO workers (name, skill, phone, area, available, available_date, photo) VALUES (?, ?, ?, ?, 0, NULL, ?)",
      [name, skill, session.phone, area, photo]
    );
  }

  const [rows] = await db.query(
    "SELECT id, name, skill, phone, area, available, photo FROM workers WHERE phone = ?",
    [session.phone]
  );
  await db.end();
  return NextResponse.json(rows[0] || { ok: true });
}
