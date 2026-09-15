import { getDb } from "@/lib/db";
import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { SKILLS } from "@/lib/skills";
import { todayIST } from "@/lib/ist";
import { ensureWorkerColumns } from "@/lib/worker-photo";

export async function GET() {
  const { response } = await requireRole("admin");
  if (response) {
    return response;
  }

  const today = todayIST();
  const db = await getDb();
  await ensureWorkerColumns(db);

  const [totals] = await db.query(
    "SELECT COUNT(*) AS total, SUM(blocked = 1) AS hidden, SUM(available = 1 AND available_date = ? AND blocked = 0) AS live FROM workers",
    [today]
  );
  const [bySkill] = await db.query(
    "SELECT skill, COUNT(*) AS total, SUM(available = 1 AND available_date = ? AND blocked = 0) AS live FROM workers GROUP BY skill",
    [today]
  );
  await db.end();

  const map = {};
  for (const row of bySkill) {
    map[row.skill] = {
      total: Number(row.total),
      live: Number(row.live),
    };
  }

  return NextResponse.json({
    total: Number(totals[0]?.total || 0),
    hidden: Number(totals[0]?.hidden || 0),
    live: Number(totals[0]?.live || 0),
    categories: SKILLS.map((skill) => ({
      skill,
      total: map[skill]?.total || 0,
      live: map[skill]?.live || 0,
    })),
  });
}
