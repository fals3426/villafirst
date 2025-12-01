"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import villas from "@/data/villas.json";
import { useStore } from "@/lib/store";

type Villa = {
  id: string;
  nom: string;
  zone: string;
  prixTotal: number;
  prixParPersonne: number;
  placesDisponible: number;
  placesTotal: number;
  vibe: string;
  description: string;
  photos: string[];
  colocataires: { age: number; vibe: string }[];
  regles: string[];
  adresse: string;
};

const formatIdr = (value: number) =>
  new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);

export default function VillaDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { onboardingData } = useStore();
  const [villa, setVilla] = useState<Villa | null>(null);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  useEffect(() => {
    const found = (villas as Villa[]).find((v) => v.id === params.id);
    if (found) {
      setVilla(found);
      setCurrentPhotoIndex(0);
    } else {
      router.push("/villas");
    }
  }, [params.id, router]);

  const compatibilityScore = useMemo(() => {
    if (!villa) return 0;
    let score = 75;
    if (
      onboardingData?.zones?.includes(villa.zone) ||
      onboardingData?.zones?.length === 0
    ) {
      score += 8;
    }
    if (
      onboardingData?.budget &&
      onboardingData.budget >= villa.prixParPersonne
    ) {
      const gap = onboardingData.budget - villa.prixParPersonne;
      score += Math.min(10, Math.round(gap / 1000000));
    }
    if (villa.placesDisponible > 1) score += 2;
    return Math.min(98, Math.max(72, score));
  }, [villa, onboardingData]);

  const goNextPhoto = (direction: "next" | "prev") => {
    if (!villa) return;
    setCurrentPhotoIndex((prev) => {
      if (direction === "next") {
        return prev === villa.photos.length - 1 ? 0 : prev + 1;
      }
      return prev === 0 ? villa.photos.length - 1 : prev - 1;
    });
  };

  if (!villa) {
    return (
      <main className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
        <p className="text-zinc-400">Chargement des details...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-6xl mx-auto px-6 py-10 space-y-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/villas"
            className="text-sm text-zinc-400 hover:text-white transition"
          >
            {"<-"} Retour aux villas
          </Link>
          <span className="text-xs uppercase tracking-[0.3em] text-zinc-500">
            Villa #{villa.id}
          </span>
        </div>

        <header className="space-y-4">
          <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">
            {villa.zone}
          </p>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-semibold">{villa.nom}</h1>
              <p className="text-zinc-400 mt-2">
                {villa.vibe} energy - {villa.placesDisponible} place
                {villa.placesDisponible > 1 ? "s" : ""} restantes
              </p>
            </div>
            <div className="text-right">
              <p className="text-4xl font-semibold">{compatibilityScore}%</p>
              <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">
                match estime
              </p>
            </div>
          </div>
        </header>

        {/* Gallery + summary */}
        <section className="grid gap-6 lg:grid-cols-[2fr,1fr]">
          <div>
            <div className="relative h-[420px] rounded-3xl overflow-hidden border border-white/10 bg-black">
              <img
                src={villa.photos[currentPhotoIndex]}
                alt={villa.nom}
                className="w-full h-full object-cover"
              />
              {villa.photos.length > 1 && (
                <>
                  <button
                    onClick={() => goNextPhoto("prev")}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 text-black rounded-full px-4 py-2 font-semibold hover:bg-white transition"
                  >
                    {"<-"}
                  </button>
                  <button
                    onClick={() => goNextPhoto("next")}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 text-black rounded-full px-4 py-2 font-semibold hover:bg-white transition"
                  >
                    {"->"}
                  </button>
                </>
              )}
              <div className="absolute top-4 right-4 rounded-full bg-white text-black px-4 py-1 text-sm font-semibold">
                {villa.placesDisponible}/{villa.placesTotal} dispo
              </div>
            </div>
            {villa.photos.length > 1 && (
              <div className="flex gap-3 overflow-x-auto mt-4 pb-2">
                {villa.photos.map((photo, index) => (
                  <button
                    key={photo}
                    onClick={() => setCurrentPhotoIndex(index)}
                    className={`h-20 w-24 flex-shrink-0 overflow-hidden rounded-2xl border ${
                      currentPhotoIndex === index
                        ? "border-white"
                        : "border-transparent opacity-60"
                    }`}
                  >
                    <img
                      src={photo}
                      alt={`Preview ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <aside className="space-y-4">
            <div className="rounded-3xl border border-white/10 bg-zinc-900/60 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-500">Total mensuel</span>
                <p className="text-2xl font-semibold">
                  {formatIdr(villa.prixTotal)}
                </p>
              </div>
              <div className="flex items-center justify-between border-t border-white/10 pt-4">
                <span className="text-sm text-zinc-500">Par personne</span>
                <p className="text-2xl font-semibold">
                  {formatIdr(villa.prixParPersonne)}
                </p>
              </div>
              <div className="flex flex-wrap gap-2 pt-2">
                <span className="rounded-full border border-white/15 px-3 py-1 text-xs text-zinc-300">
                  Vibe {villa.vibe}
                </span>
                <span className="rounded-full border border-white/15 px-3 py-1 text-xs text-zinc-300">
                  {villa.placesTotal} colocs max
                </span>
                <span className="rounded-full border border-white/15 px-3 py-1 text-xs text-zinc-300">
                  {formatIdr(Math.round(villa.prixParPersonne * 0.1))} caution
                </span>
              </div>
            </div>
            <div className="rounded-3xl border border-dashed border-white/20 p-6 space-y-3 text-sm text-zinc-300">
              <p className="font-semibold text-white">Pre-reserver 25 EUR</p>
              <p>
                Le paiement bloque ta place, ouvre le groupe WhatsApp et partage
                l'adresse exacte de la villa.
              </p>
              <p className="text-xs text-zinc-500">
                Frais deduits de ton loyer lors de l'arrivee.
              </p>
            </div>
            <button
              onClick={() => router.push(`/booking/${villa.id}`)}
              className="w-full rounded-full bg-white text-black py-4 font-semibold text-lg"
            >
              Reserver ma place
            </button>
            <button
              onClick={() => router.push("/villas")}
              className="w-full rounded-full border border-white/20 py-4 text-sm text-zinc-300"
            >
              Voir d'autres villas
            </button>
          </aside>
        </section>

        {/* Description & details */}
        <section className="grid gap-8 lg:grid-cols-[1.7fr,1.1fr]">
          <div className="space-y-6">
            <div className="rounded-3xl border border-white/10 bg-zinc-900/60 p-6 space-y-3">
              <h2 className="text-xl font-semibold">Pourquoi on aime</h2>
              <p className="text-zinc-300 leading-relaxed">{villa.description}</p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-zinc-900/60 p-6 space-y-4">
              <h2 className="text-xl font-semibold">Regles de vie</h2>
              <ul className="space-y-3 text-sm text-zinc-300">
                {villa.regles.map((rule) => (
                  <li
                    key={rule}
                    className="flex items-start gap-3 border-b border-white/5 pb-3 last:border-b-0 last:pb-0"
                  >
                    <span className="text-white/40 text-lg">-</span>
                    {rule}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border border-white/10 bg-zinc-900/60 p-6 space-y-4">
              <h2 className="text-xl font-semibold">Colocs actuels</h2>
              <div className="space-y-3">
                {villa.colocataires.map((coloc, index) => (
                  <div
                    key={`${coloc.age}-${index}`}
                    className="flex items-center justify-between rounded-2xl border border-white/10 px-4 py-3"
                  >
                    <div>
                      <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">
                        {coloc.vibe}
                      </p>
                      <p className="text-lg font-semibold">{coloc.age} ans</p>
                    </div>
                    <span className="text-xs text-zinc-400">
                      Looking for +
                      {villa.placesDisponible > 1
                        ? ` ${villa.placesDisponible} colocs`
                        : " 1 coloc"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-zinc-900/60 p-6 space-y-4 text-sm text-zinc-300">
              <h2 className="text-xl font-semibold">Adresse & acces</h2>
              <p>{villa.adresse}</p>
              <p className="text-xs text-zinc-500">
                Partagee uniquement avec le groupe pour respecter l'intimite des
                residents.
              </p>
              <div className="h-40 rounded-2xl border border-dashed border-white/15 flex items-center justify-center text-zinc-500">
                Map bientot dispo
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}








