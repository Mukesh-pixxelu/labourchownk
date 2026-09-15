import { getDb } from "@/lib/db";
import { NextResponse } from "next/server";
import { SKILLS } from "@/lib/skills";
import { ensureWorkerColumns } from "@/lib/worker-photo";

export async function GET() {
  try {
    const bySkill = {};
    const db = await getDb();
    await ensureWorkerColumns(db);
    const [rows] = await db.query(
      "SELECT skill, COUNT(*) AS total FROM workers WHERE blocked = 0 GROUP BY skill"
    );
    await db.end();

    for (const row of rows) {
      bySkill[row.skill] = Number(row.total);
    }

    const categories = SKILLS.map((skill) => ({
      skill,
      total: bySkill[skill] || 0,
    }));
    const artists = categories.reduce((sum, item) => sum + item.total, 0);

    return NextResponse.json({ categories, artists });
  } catch {
    return NextResponse.json({
      categories: SKILLS.map((skill) => ({ skill, total: 0 })),
      artists: 0,
    });
  }
}
