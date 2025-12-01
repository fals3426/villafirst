import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { setOwnerSession, verifyPassword } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ message: "Email et mot de passe requis." }, { status: 400 });
    }

    const owner = await prisma.owner.findUnique({ where: { email } });
    if (!owner) {
      return NextResponse.json({ message: "Identifiants invalides." }, { status: 401 });
    }

    const isValid = await verifyPassword(password, owner.passwordHash);
    if (!isValid) {
      return NextResponse.json({ message: "Identifiants invalides." }, { status: 401 });
    }

    setOwnerSession(owner.id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("login error", error);
    return NextResponse.json({ message: "Erreur serveur." }, { status: 500 });
  }
}
