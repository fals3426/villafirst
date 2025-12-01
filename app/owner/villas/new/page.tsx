import Link from "next/link";
import { redirect } from "next/navigation";
import { getOwnerFromSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { VillaForm } from "@/components/owner/VillaForm";

export default async function NewVillaPage() {
  const session = getOwnerFromSession();
  if (!session) {
    redirect("/owner/login");
  }

  const owner = await prisma.owner.findUnique({ where: { id: session.ownerId } });
  if (!owner) redirect("/owner/login");
  if (!owner.profileCompleted) redirect("/owner/onboarding");

  return (
    <div className="space-y-8 text-white">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">Nouvelle villa</p>
          <h1 className="text-3xl font-semibold">Publie ta villa</h1>
          <p className="text-zinc-400 mt-2">Nous validerons ta soumission sous 24h apres verification.</p>
        </div>
        <Link href="/owner/dashboard" className="text-sm text-zinc-400 underline">
          Retour au dashboard
        </Link>
      </div>
      <div className="space-y-6 rounded-3xl border border-white/10 bg-zinc-900/60 p-8">
        <div className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-zinc-300">
          <p className="font-semibold text-white">Etape 1 / 2 — Fiche villa</p>
          <p className="text-zinc-400">
            Renseigne toutes les informations de ta villa. Tu ajouteras les documents officiels a l'etape
            suivante.
          </p>
        </div>
        <VillaForm mode="create" />
      </div>
    </div>
  );
}
