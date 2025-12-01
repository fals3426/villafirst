import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, setOwnerSession } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json({ message: "Champs requis manquants." }, { status: 400 });
    }

    const existing = await prisma.owner.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ message: "Cet email est deja utilise." }, { status: 400 });
    }

    const passwordHash = await hashPassword(password);
    const owner = await prisma.owner.create({
      data: { name, email, passwordHash },
      select: { id: true },
    });

    setOwnerSession(owner.id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("register error", error);
    return NextResponse.json({ message: "Erreur serveur." }, { status: 500 });
  }
}
