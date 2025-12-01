import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOwnerFromSession } from "@/lib/auth";

export async function POST(request: Request) {
  const session = getOwnerFromSession();
  if (!session) {
    return NextResponse.json({ message: "Non authentifie" }, { status: 401 });
  }

  try {
    const { firstName, lastName, personalAddress, nationalIdUrl } = await request.json();
    if (!firstName || !lastName || !personalAddress || !nationalIdUrl) {
      return NextResponse.json({ message: "Tous les champs sont requis" }, { status: 400 });
    }

    await prisma.owner.update({
      where: { id: session.ownerId },
      data: {
        firstName,
        lastName,
        personalAddress,
        nationalIdUrl,
        profileCompleted: true,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("owner profile error", error);
    return NextResponse.json({ message: "Erreur serveur." }, { status: 500 });
  }
}
