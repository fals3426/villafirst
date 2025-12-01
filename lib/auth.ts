import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const OWNER_SESSION_COOKIE = "owner_session";
const ONE_WEEK = 60 * 60 * 24 * 7;

const getSecret = () => {
  const secret = process.env.OWNER_JWT_SECRET;
  if (!secret) {
    throw new Error("OWNER_JWT_SECRET manquant. Ajoute-le dans ton .env.local");
  }
  return secret;
};

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export function setOwnerSession(ownerId: string) {
  const token = jwt.sign({ ownerId }, getSecret(), { expiresIn: ONE_WEEK });
  cookies().set(OWNER_SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: ONE_WEEK,
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
}

export function clearOwnerSession() {
  cookies().delete(OWNER_SESSION_COOKIE);
}

function parseOwnerToken(token?: string) {
  if (!token) return null;
  try {
    return jwt.verify(token, getSecret()) as { ownerId: string };
  } catch {
    return null;
  }
}

export function getOwnerFromCookieHeader(cookieHeader?: string | null) {
  if (!cookieHeader) return null;
  const pairs = cookieHeader.split(";").map((cookie) => cookie.trim()).filter(Boolean);
  for (const pair of pairs) {
    const idx = pair.indexOf("=");
    if (idx === -1) continue;
    const key = pair.slice(0, idx).trim();
    if (key !== OWNER_SESSION_COOKIE) continue;
    const value = pair.slice(idx + 1);
    return parseOwnerToken(decodeURIComponent(value));
  }
  return null;
}

export function getOwnerFromSession(): { ownerId: string } | null {
  const cookie = cookies().get(OWNER_SESSION_COOKIE);
  if (!cookie?.value) return null;
  const session = parseOwnerToken(cookie.value);
  if (!session) {
    cookies().delete(OWNER_SESSION_COOKIE);
  }
  return session;
}

export function requireOwnerSession() {
  const session = getOwnerFromSession();
  if (!session) {
    throw new Error("NOT_AUTHENTICATED");
  }
  return session;
}
