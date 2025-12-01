import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOwnerFromSession } from "@/lib/auth";

type RouteParams = {
  params: { id: string };
};

export async function PATCH(request: Request, { params }: RouteParams) {
  const session = getOwnerFromSession();
  if (!session) {
    return NextResponse.json({ message: "Non authentifie" }, { status: 401 });
  }

  try {
    const { ownerType } = await request.json();
    if (!ownerType) {
      return NextResponse.json({ message: "ownerType requis" }, { status: 400 });
    }

    const villa = await prisma.villa.findUnique({ where: { id: params.id } });
    if (!villa || villa.ownerId !== session.ownerId) {
      return NextResponse.json({ message: "Villa introuvable" }, { status: 404 });
    }

    const updated = await prisma.villa.update({
      where: { id: villa.id },
      data: { ownerType },
    });

    return NextResponse.json({ ownerType: updated.ownerType });
  } catch (error) {
    console.error("ownerType update error", error);
    return NextResponse.json({ message: "Erreur serveur." }, { status: 500 });
  }
}
