import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const cookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  path: "/",
  maxAge: 60 * 60 * 24 * 30,
};

export async function getSession() {
  const store = await cookies();
  const phone = store.get("lc_phone")?.value || "";
  const role = store.get("lc_role")?.value || "";
  if (role === "admin" && phone) {
    return { phone, role };
  }
  if (!/^\d{10}$/.test(phone)) {
    return null;
  }
  if (role !== "labour" && role !== "thekedar") {
    return null;
  }
  return { phone, role };
}

export async function requireRole(role) {
  const session = await getSession();
  if (!session) {
    return {
      session: null,
      response: NextResponse.json({ error: "Login chahiye" }, { status: 401 }),
    };
  }
  if (role && session.role !== role) {
    return {
      session: null,
      response: NextResponse.json({ error: "Wrong role" }, { status: 403 }),
    };
  }
  return { session, response: null };
}

export async function setSession(phone, role) {
  const store = await cookies();
  store.set("lc_phone", phone, cookieOptions);
  store.set("lc_role", role, cookieOptions);
}

export async function clearSession() {
  const store = await cookies();
  store.delete("lc_phone");
  store.delete("lc_role");
}
