import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getOwnerFromSession } from "@/lib/auth";
import { VillaCard } from "@/components/owner/VillaCard";
import { LogoutButton } from "@/components/owner/LogoutButton";

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

export default async function OwnerDashboardPage() {
  const session = getOwnerFromSession();
  if (!session) {
    redirect("/owner/login");
  }

  const owner = await prisma.owner.findUnique({
    where: { id: session.ownerId },
    include: { villas: { orderBy: { createdAt: "desc" } } },
  });

  if (!owner) {
    redirect("/owner/login");
  }

  if (!owner.profileCompleted) {
    redirect("/owner/onboarding");
  }

  const validatedCount = owner.villas.filter((villa) => villa.statut === "VALIDEE").length;
  const pendingCount = owner.villas.length - validatedCount;

  return (
    <div className="space-y-10 text-white">
      <header className="flex flex-wrap items-start justify-between gap-6">
        <div className="space-y-3">
          <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">Tableau de bord</p>
          <h1 className="text-4xl font-semibold">Salut {owner.name.split(" ")[0]} !</h1>
          <p className="text-zinc-400">
            Tu geres {owner.villas.length} villa{owner.villas.length > 1 ? "s" : ""}. Ajoute-en une nouvelle ou mets a jour ton inventaire.
          </p>
        </div>
        <div className="flex w-full max-w-sm flex-col gap-3 sm:flex-row sm:items-center">
          <Link
            href="/owner/villas/new"
            className="w-full rounded-2xl bg-white px-4 py-3 text-center text-sm font-semibold text-black transition hover:bg-zinc-200"
          >
            Ajouter une villa
          </Link>
          <LogoutButton />
        </div>
        <div className="w-full grid gap-4 sm:grid-cols-2 lg:max-w-lg">
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">Validées</p>
            <p className="text-2xl font-semibold">{validatedCount}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">En attente</p>
            <p className="text-2xl font-semibold">{pendingCount}</p>
          </div>
        </div>
      </header>

      {owner.villas.length === 0 ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-zinc-900/60 p-8 space-y-4">
            <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">Prochaine étape</p>
            <h2 className="text-3xl font-semibold">Publie ta premiere villa</h2>
            <p className="text-zinc-400">
              Ajoute les infos essentielles (zone, vibe, prix, photos) et notre equipe verifie la villa sous 24h avant de l'envoyer aux colivers.
            </p>
            <Link
              href="/owner/villas/new"
              className="inline-flex items-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-black"
            >
              Ajouter ma premiere villa
            </Link>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-zinc-300">
              Tu peux sauvegarder une villa meme incomplete : reviens plus tard pour la finaliser.
            </div>
          </div>
          <div className="rounded-3xl border border-white/10 bg-zinc-900/60 p-8 space-y-5">
            <h3 className="text-xl font-semibold">Ce que voient les colivers</h3>
            <ul className="space-y-3 text-sm text-zinc-300">
              <li className="flex gap-3">
                <span className="text-white/40 text-lg">-</span> Fiche premium avec vibe, prix par personne et photos immersives.
              </li>
              <li className="flex gap-3">
                <span className="text-white/40 text-lg">-</span> Processus de matching : nous validons les profils avant de partager l'adresse.
              </li>
              <li className="flex gap-3">
                <span className="text-white/40 text-lg">-</span> Chat prive apres paiement pour rester discret sur tes coordonnées.
              </li>
            </ul>
            <div className="rounded-2xl border border-dashed border-white/20 p-4 text-xs text-zinc-500">
              Tips : prevois 3 photos minimum, precise la vibe (work/chill/party) et estime un prix par personne.
            </div>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {owner.villas.map((villa) => {
            let photos: string[] = [];
            try {
              photos = JSON.parse(villa.photos ?? "[]");
            } catch {
              photos = [];
            }
            return (
              <VillaCard
                key={villa.id}
                villa={{
                  id: villa.id,
                  nom: villa.nom,
                  zone: zoneLabel[villa.zone as keyof typeof zoneLabel],
                  vibe: vibeLabel[villa.vibe as keyof typeof vibeLabel],
                  prixParPersonne: villa.prixParPersonne,
                  statut: villa.statut as "PENDING" | "VALIDEE",
                  photo: photos[0],
                }}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
