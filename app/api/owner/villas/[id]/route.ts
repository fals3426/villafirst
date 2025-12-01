import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOwnerFromSession } from "@/lib/auth";

const zoneEnum = {
  canggu: "CANGGU",
  pererenan: "PERERENAN",
  seminyak: "SEMINYAK",
  ubud: "UBUD",
  autre: "AUTRE",
} as const;

const vibeEnum = {
  work: "WORK",
  chill: "CHILL",
  mix: "MIX",
  party: "PARTY",
} as const;

type RouteProps = {
  params: { id: string };
};

export async function PATCH(request: Request, { params }: RouteProps) {
  const session = getOwnerFromSession();
  if (!session) {
    return NextResponse.json({ message: "Non authentifie" }, { status: 401 });
  }

  try {
    const villa = await prisma.villa.findUnique({ where: { id: params.id } });
    if (!villa || villa.ownerId !== session.ownerId) {
      return NextResponse.json({ message: "Villa introuvable" }, { status: 404 });
    }

    const body = await request.json();

    const data = {
      nom: body.nom ?? villa.nom,
      zone: body.zone
        ? zoneEnum[body.zone.toLowerCase() as keyof typeof zoneEnum] ?? villa.zone
        : villa.zone,
      ownerType: body.ownerType ?? villa.ownerType,
      adresseComplete: body.adresseComplete ?? villa.adresseComplete,
      chambres: body.chambres !== undefined ? Number(body.chambres) : villa.chambres,
      placesTotal: body.placesTotal !== undefined ? Number(body.placesTotal) : villa.placesTotal,
      prixTotal: body.prixTotal !== undefined ? Number(body.prixTotal) : villa.prixTotal,
      prixParPersonne:
        body.prixParPersonne !== undefined ? Number(body.prixParPersonne) : villa.prixParPersonne,
      vibe: body.vibe
        ? vibeEnum[body.vibe.toLowerCase() as keyof typeof vibeEnum] ?? villa.vibe
        : villa.vibe,
      description: body.description ?? villa.description,
      photos: body.photos ? JSON.stringify(body.photos) : villa.photos,
      documents: body.documents ? JSON.stringify(body.documents) : villa.documents,
    };

    const updated = await prisma.villa.update({
      where: { id: villa.id },
      data,
    });

    return NextResponse.json({ villa: { ...updated, photos: JSON.parse(updated.photos) } });
  } catch (error) {
    console.error("update villa error", error);
    return NextResponse.json({ message: "Erreur serveur." }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: RouteProps) {
  const session = getOwnerFromSession();
  if (!session) {
    return NextResponse.json({ message: "Non authentifie" }, { status: 401 });
  }

  try {
    const villa = await prisma.villa.findUnique({ where: { id: params.id } });
    if (!villa || villa.ownerId !== session.ownerId) {
      return NextResponse.json({ message: "Villa introuvable" }, { status: 404 });
    }

    await prisma.villa.delete({ where: { id: villa.id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("delete villa error", error);
    return NextResponse.json({ message: "Erreur serveur." }, { status: 500 });
  }
}
