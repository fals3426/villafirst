import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getOwnerFromSession } from "@/lib/auth";
import { VillaForm } from "@/components/owner/VillaForm";
import { DocumentsSection } from "@/components/owner/DocumentsSection";

const zoneLabel = {
  CANGGU: "Canggu",
  PERERENAN: "Pererenan",
  SEMINYAK: "Seminyak",
  UBUD: "Ubud",
  AUTRE: "Autre",
} as const;

const vibeLabel = {
  WORK: "Work",
  CHILL: "Chill",
  MIX: "Mix",
  PARTY: "Party",
} as const;

const statutLabel = {
  PENDING: "PENDING",
  VALIDEE: "VALIDEE",
} as const;

type EditProps = {
  params: { id: string };
};

export default async function EditVillaPage({ params }: EditProps) {
  const session = getOwnerFromSession();
  if (!session) {
    redirect("/owner/login");
  }

  const owner = await prisma.owner.findUnique({
    where: { id: session.ownerId },
    select: { profileCompleted: true },
  });

  if (!owner) redirect("/owner/login");
  if (!owner.profileCompleted) redirect("/owner/onboarding");

  const villa = await prisma.villa.findUnique({
    where: { id: params.id },
  });

  if (!villa || villa.ownerId !== session.ownerId) {
    notFound();
  }

  const formatted = {
    id: villa.id,
    nom: villa.nom,
    zone: zoneLabel[villa.zone as keyof typeof zoneLabel],
    ownerType: villa.ownerType ?? "proprietaire",
    adresseComplete: villa.adresseComplete,
    chambres: villa.chambres,
    placesTotal: villa.placesTotal,
    prixTotal: villa.prixTotal,
    prixParPersonne: villa.prixParPersonne,
    vibe: vibeLabel[villa.vibe as keyof typeof vibeLabel],
    description: villa.description,
    photos: JSON.parse(villa.photos) as string[],
    documents: JSON.parse(villa.documents ?? "[]") as string[],
    statut: statutLabel[villa.statut as keyof typeof statutLabel],
  };

  return (
    <div className="space-y-8 text-white">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">Edition</p>
          <h1 className="text-3xl font-semibold">Modifier {villa.nom}</h1>
        </div>
        <Link href="/owner/dashboard" className="text-sm text-zinc-400 underline">
          Retour au dashboard
        </Link>
      </div>
      <div className="rounded-3xl border border-white/10 bg-zinc-900/60 p-8 space-y-10">
        <VillaForm mode="edit" villa={formatted} />
        <DocumentsSection villaId={villa.id} initialDocuments={formatted.documents} />
      </div>
    </div>
  );
}
