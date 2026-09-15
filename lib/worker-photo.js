import { mkdir, readdir, unlink, writeFile } from "fs/promises";
import path from "path";

const TYPES = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

const MAX_BYTES = 2 * 1024 * 1024;

export async function ensureWorkerColumns(db) {
  const [photoCols] = await db.query("SHOW COLUMNS FROM workers LIKE 'photo'");
  if (!photoCols.length) {
    await db.query("ALTER TABLE workers ADD COLUMN photo VARCHAR(255) NULL");
  }
  const [blockCols] = await db.query("SHOW COLUMNS FROM workers LIKE 'blocked'");
  if (!blockCols.length) {
    await db.query(
      "ALTER TABLE workers ADD COLUMN blocked TINYINT NOT NULL DEFAULT 0"
    );
  }
}

export async function ensurePhotoColumn(db) {
  return ensureWorkerColumns(db);
}

export async function deleteWorkerPhotos(phone) {
  const dir = path.join(process.cwd(), "public", "uploads", "workers");
  let files = [];
  try {
    files = await readdir(dir);
  } catch {
    return;
  }
  await Promise.all(
    files
      .filter((name) => name.startsWith(phone + "-") || name.startsWith(phone + "."))
      .map((name) => unlink(path.join(dir, name)))
  );
}

export async function saveWorkerPhoto(phone, file) {
  if (!file || typeof file === "string" || !file.size) {
    return null;
  }
  if (file.size > MAX_BYTES) {
    throw new Error("Photo 2MB se chhoti honi chahiye");
  }
  const ext = TYPES[file.type];
  if (!ext) {
    throw new Error("JPG, PNG ya WEBP daalo");
  }

  const dir = path.join(process.cwd(), "public", "uploads", "workers");
  await mkdir(dir, { recursive: true });
  await deleteWorkerPhotos(phone);

  const filename = phone + "-" + Date.now() + "." + ext;
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(dir, filename), buffer);
  return "/uploads/workers/" + filename;
}
