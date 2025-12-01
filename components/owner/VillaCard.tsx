"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { StatusBadge } from "./StatusBadge";
import { OwnerButton } from "./Button";

type Props = {
  villa: {
    id: string;
    nom: string;
    zone: string;
    vibe: string;
    prixParPersonne: number;
    statut: "PENDING" | "VALIDEE";
    photo?: string | null;
  };
};

const vibeClass: Record<string, string> = {
  Work: "bg-sky-500/20 text-sky-100",
  Chill: "bg-teal-500/20 text-teal-100",
  Mix: "bg-violet-500/20 text-violet-100",
  Party: "bg-rose-500/20 text-rose-100",
};

export function VillaCard({ villa }: Props) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    const confirm = window.confirm(
      "Supprimer cette villa ? Elle ne sera plus visible dans ton inventaire."
    );
    if (!confirm) return;

    setDeleting(true);
    try {
      const response = await fetch(`/api/owner/villas/${villa.id}`, { method: "DELETE" });
      if (!response.ok) {
        throw new Error("Suppression impossible");
      }
      router.refresh();
    } catch {
      alert("Erreur lors de la suppression. Reessaie ou contacte-nous.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="rounded-3xl border border-white/10 bg-zinc-900/60 text-white overflow-hidden">
      {villa.photo ? (
        <div className="h-40 w-full overflow-hidden">
          <img src={villa.photo} alt={villa.nom} className="h-full w-full object-cover" />
        </div>
      ) : (
        <div className="h-40 w-full bg-gradient-to-r from-zinc-800 to-zinc-900" />
      )}
      <div className="space-y-4 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">{villa.zone}</p>
            <h3 className="text-2xl font-semibold mt-1">{villa.nom}</h3>
          </div>
        <StatusBadge statut={villa.statut} />
      </div>
        <div className="flex items-center gap-2 text-sm text-zinc-400">
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              vibeClass[villa.vibe] ?? "bg-white/10 text-white"
            }`}
          >
            {villa.vibe}
          </span>
          <span>{villa.prixParPersonne.toLocaleString("fr-FR")} IDR / pers.</span>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <OwnerButton onClick={() => router.push(`/owner/villas/${villa.id}/edit`)}>
            Modifier
          </OwnerButton>
          <OwnerButton variant="outline" onClick={handleDelete} loading={deleting}>
            {deleting ? "Suppression..." : "Supprimer"}
          </OwnerButton>
        </div>
      </div>
    </div>
  );
}
