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

const unauthorized = NextResponse.json({ message: "Non authentifie" }, { status: 401 });

export async function GET() {
  const session = getOwnerFromSession();
  if (!session) return unauthorized;

  const villas = await prisma.villa.findMany({
    where: { ownerId: session.ownerId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    villas: villas.map((villa) => ({
      ...villa,
      photos: JSON.parse(villa.photos),
      documents: JSON.parse(villa.documents ?? "[]"),
    })),
  });
}

export async function POST(request: Request) {
  const session = getOwnerFromSession();
  if (!session) return unauthorized;

  try {
    const body = await request.json();
    const requiredFields = [
      "nom",
      "zone",
      "ownerType",
      "adresseComplete",
      "chambres",
      "placesTotal",
      "prixTotal",
      "prixParPersonne",
      "vibe",
      "description",
      "photos",
    ];

    for (const field of requiredFields) {
      if (body[field] === undefined || body[field] === null || body[field] === "") {
        return NextResponse.json({ message: `Champ ${field} manquant.` }, { status: 400 });
      }
    }

    const data = {
      ownerId: session.ownerId,
      nom: body.nom,
      zone: zoneEnum[body.zone.toLowerCase() as keyof typeof zoneEnum] ?? "AUTRE",
      ownerType: body.ownerType ?? "proprietaire",
      adresseComplete: body.adresseComplete,
      chambres: Number(body.chambres),
      placesTotal: Number(body.placesTotal),
      prixTotal: Number(body.prixTotal),
      prixParPersonne: Number(body.prixParPersonne),
      vibe: vibeEnum[body.vibe.toLowerCase() as keyof typeof vibeEnum] ?? "MIX",
      description: body.description,
      photos: JSON.stringify(body.photos ?? []),
      documents: JSON.stringify(body.documents ?? []),
      statut: "PENDING",
    };

    const villa = await prisma.villa.create({ data });
    return NextResponse.json({
      villa: {
        ...villa,
        photos: JSON.parse(villa.photos),
        documents: JSON.parse(villa.documents ?? "[]"),
      },
    });
  } catch (error) {
    console.error("create villa error", error);
    return NextResponse.json({ message: "Erreur serveur." }, { status: 500 });
  }
}
