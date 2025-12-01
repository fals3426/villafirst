import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOwnerFromSession } from "@/lib/auth";

type RouteParams = {
  params: { id: string };
};

async function getAuthorizedVilla(id: string, ownerId: string) {
  const villa = await prisma.villa.findUnique({ where: { id } });
  if (!villa || villa.ownerId !== ownerId) {
    return null;
  }
  return villa;
}

export async function POST(request: Request, { params }: RouteParams) {
  const session = getOwnerFromSession();
  if (!session) {
    return NextResponse.json({ message: "Non authentifie" }, { status: 401 });
  }

  try {
    const villa = await getAuthorizedVilla(params.id, session.ownerId);
    if (!villa) return NextResponse.json({ message: "Villa introuvable" }, { status: 404 });

    const { documentUrl } = await request.json();
    if (!documentUrl) {
      return NextResponse.json({ message: "documentUrl requis" }, { status: 400 });
    }

    const docs = JSON.parse(villa.documents ?? "[]");
    docs.push(documentUrl);

    const updated = await prisma.villa.update({
      where: { id: villa.id },
      data: { documents: JSON.stringify(docs) },
    });

    return NextResponse.json({ documents: JSON.parse(updated.documents) });
  } catch (error) {
    console.error("documents add error", error);
    return NextResponse.json({ message: "Erreur serveur." }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  const session = getOwnerFromSession();
  if (!session) {
    return NextResponse.json({ message: "Non authentifie" }, { status: 401 });
  }

  try {
    const villa = await getAuthorizedVilla(params.id, session.ownerId);
    if (!villa) return NextResponse.json({ message: "Villa introuvable" }, { status: 404 });

    const { documentUrl } = await request.json();
    if (!documentUrl) {
      return NextResponse.json({ message: "documentUrl requis" }, { status: 400 });
    }

    const docs: string[] = JSON.parse(villa.documents ?? "[]");
    const filtered = docs.filter((doc) => doc !== documentUrl);

    const updated = await prisma.villa.update({
      where: { id: villa.id },
      data: { documents: JSON.stringify(filtered) },
    });

    return NextResponse.json({ documents: JSON.parse(updated.documents) });
  } catch (error) {
    console.error("documents delete error", error);
    return NextResponse.json({ message: "Erreur serveur." }, { status: 500 });
  }
}
