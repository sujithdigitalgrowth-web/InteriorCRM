import "server-only";
import { randomBytes } from "crypto";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

const COOKIE_NAME = "roar_session";
const SESSION_DAYS = 30;
const GUEST_MEMBER_ID = "guest-admin";

export async function createSession(teamMemberId: string) {
  const rawToken = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);

  await prisma.session.create({
    data: { token: rawToken, teamMemberId, expiresAt },
  });

  const store = await cookies();
  store.set(COOKIE_NAME, rawToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function getSessionMember() {
  if (process.env.DEMO_MODE === "1") {
    return prisma.teamMember.findUnique({ where: { id: GUEST_MEMBER_ID } });
  }

  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;

  const session = await prisma.session.findUnique({
    where: { token },
    include: { teamMember: true },
  });

  if (!session || session.expiresAt < new Date()) {
    if (session) await prisma.session.delete({ where: { id: session.id } }).catch(() => {});
    return null;
  }

  return session.teamMember;
}

export async function destroySession() {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (token) {
    await prisma.session.deleteMany({ where: { token } });
  }
  store.delete(COOKIE_NAME);
}
