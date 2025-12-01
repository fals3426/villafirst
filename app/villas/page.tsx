"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import villasData from "@/data/villas.json";

type Villa = {
  id: string;
  nom: string;
  zone: string;
  prixTotal: number;
  prixParPersonne: number;
  placesDisponible: number;
  placesTotal: number;
  vibe: string;
  photos: string[];
};

type VillaMatch = Villa & { compatibility: number };

const formatIdr = (value: number) =>
  new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);

const baseZones = Array.from(
  new Set((villasData as Villa[]).map((villa) => villa.zone))
);
const zoneOptions = ["Toutes", ...baseZones];
const vibeOptions = ["Toutes", "Work", "Chill", "Party", "Mix"];

export default function VillasPage() {
  const router = useRouter();
  const onboardingData = useStore((state) => state.onboardingData);
  const [selectedZone, setSelectedZone] = useState<string>("Toutes");
  const [selectedVibe, setSelectedVibe] = useState<string>("Toutes");
  const [maxBudget, setMaxBudget] = useState<number>(12000000);
  const [onlyAvailable, setOnlyAvailable] = useState<boolean>(true);

  useEffect(() => {
    const resolved =
      onboardingData ??
      (() => {
        if (typeof window === "undefined") return null;
        const raw = localStorage.getItem("onboardingData");
        return raw ? JSON.parse(raw) : null;
      })();

    if (resolved?.budget) {
      setMaxBudget(resolved.budget);
    }
    if (resolved?.zones?.length) {
      setSelectedZone(resolved.zones[0]);
    }
  }, [onboardingData]);

  const filteredVillas = useMemo<VillaMatch[]>(() => {
    const withScore = (villasData as Villa[]).map((villa) => {
      let score = 70;
      if (selectedZone !== "Toutes" && villa.zone === selectedZone) score += 10;
      if (selectedVibe !== "Toutes" && villa.vibe === selectedVibe)
        score += 8;
      const budgetDelta = maxBudget - villa.prixParPersonne;
      if (budgetDelta >= 0) {
        score += Math.min(10, Math.round(budgetDelta / 1000000));
      }
      if (villa.placesDisponible === villa.placesTotal) score += 5;
      return { ...villa, compatibility: Math.min(98, Math.max(72, score)) };
    });

    return withScore
      .filter((villa) =>
        selectedZone === "Toutes" ? true : villa.zone === selectedZone
      )
      .filter((villa) =>
        selectedVibe === "Toutes" ? true : villa.vibe === selectedVibe
      )
      .filter((villa) => villa.prixParPersonne <= maxBudget)
      .filter((villa) => (onlyAvailable ? villa.placesDisponible > 0 : true))
      .sort((a, b) => b.compatibility - a.compatibility);
  }, [selectedZone, selectedVibe, maxBudget, onlyAvailable]);

  const activeFilters = [
    selectedZone !== "Toutes" ? selectedZone : null,
    selectedVibe !== "Toutes" ? selectedVibe : null,
    `Budget <= ${formatIdr(maxBudget)}`,
    onlyAvailable ? "Places dispo" : null,
  ].filter(Boolean) as string[];

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-6xl mx-auto px-6 py-12 space-y-10">
        <header className="space-y-4">
          <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">
            Explorer
          </p>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="space-y-3">
              <h1 className="text-3xl md:text-4xl font-semibold">
                Villas disponibles
              </h1>
              <p className="text-zinc-400 max-w-2xl">
                Filtre par vibe, zone et budget pour trouver une coloc qui
                matche ton rythme. Tes prefs d'onboarding sont deja chargees.
              </p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-semibold">{filteredVillas.length}</p>
              <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">
                villas matchent
              </p>
            </div>
          </div>

          {activeFilters.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {activeFilters.map((filter) => (
                <span
                  key={filter}
                  className="rounded-full border border-white/15 px-4 py-1 text-xs text-zinc-300"
                >
                  {filter}
                </span>
              ))}
            </div>
          )}
        </header>

        <section className="grid gap-6 md:grid-cols-[1.1fr,2fr]">
          {/* Filters */}
          <div className="rounded-3xl border border-white/10 bg-zinc-900/60 p-6 space-y-6">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold">Zone</h2>
                <button
                  onClick={() => setSelectedZone("Toutes")}
                  className="text-xs text-zinc-500 underline"
                >
                  reinitialiser
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {zoneOptions.map((zone) => {
                  const active = selectedZone === zone;
                  return (
                    <button
                      key={zone}
                      onClick={() => setSelectedZone(zone)}
                      className={`rounded-full border px-4 py-2 text-sm transition ${
                        active
                          ? "bg-white text-black border-white"
                          : "border-white/15 text-white"
                      }`}
                    >
                      {zone}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-3">Vibe</h2>
              <div className="flex flex-wrap gap-2">
                {vibeOptions.map((vibe) => {
                  const active = selectedVibe === vibe;
                  return (
                    <button
                      key={vibe}
                      onClick={() => setSelectedVibe(vibe)}
                      className={`rounded-full border px-4 py-2 text-sm ${
                        active
                          ? "bg-white text-black border-white"
                          : "border-white/15 text-white"
                      }`}
                    >
                      {vibe}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold">Budget max</h2>
                <span className="text-sm text-zinc-400">
                  {formatIdr(maxBudget)}
                </span>
              </div>
              <input
                type="range"
                min={5000000}
                max={18000000}
                step={250000}
                value={maxBudget}
                onChange={(e) => setMaxBudget(Number(e.target.value))}
                className="w-full accent-white"
              />
              <div className="flex justify-between text-xs text-zinc-500 mt-2">
                <span>5M</span>
                <span>10M</span>
                <span>15M</span>
                <span>18M</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold">Places disponibles</p>
                <p className="text-xs text-zinc-500">
                  Mets en pause les villas deja completes.
                </p>
              </div>
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={onlyAvailable}
                  onChange={() => setOnlyAvailable((prev) => !prev)}
                  className="sr-only"
                />
                <span
                  className={`h-6 w-12 rounded-full border border-white/15 p-1 transition ${
                    onlyAvailable ? "bg-white" : "bg-transparent"
                  }`}
                >
                  <span
                    className={`block h-full w-4 rounded-full bg-black transition ${
                      onlyAvailable ? "translate-x-6" : ""
                    }`}
                  />
                </span>
              </label>
            </div>
          </div>

          {/* Villa cards */}
          <div className="space-y-4">
            {filteredVillas.length === 0 && (
              <div className="rounded-3xl border border-dashed border-white/15 p-12 text-center text-zinc-400">
                <p className="text-lg font-semibold text-white">
                  Aucun match pour ces filtres
                </p>
                <p className="mt-2 text-sm">
                  Ajuste ton budget ou ajoute une nouvelle zone pour voir plus
                  de villas.
                </p>
              </div>
            )}

            {filteredVillas.map((villa) => (
              <div
                key={villa.id}
                className="rounded-3xl border border-white/10 bg-zinc-900/60 overflow-hidden lg:flex"
              >
                <div className="lg:w-2/5 h-64 lg:h-auto bg-black relative">
                  <img
                    src={villa.photos[0]}
                    alt={villa.nom}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute top-4 left-4 rounded-full bg-white text-black px-4 py-1 text-sm font-semibold">
                    {villa.compatibility}% match
                  </div>
                </div>
                <div className="flex-1 p-6 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">
                        {villa.zone}
                      </p>
                      <h2 className="text-2xl font-semibold">{villa.nom}</h2>
                    </div>
                    <span className="rounded-full border border-white/15 px-4 py-1 text-sm">
                      {villa.vibe}
                    </span>
                  </div>

                  <p className="text-sm text-zinc-400">
                    {villa.placesDisponible} place
                    {villa.placesDisponible > 1 ? "s" : ""} restante
                    {villa.placesDisponible > 1 ? "s" : ""} - Cap {villa.placesTotal} colocs
                  </p>

                  <div className="flex flex-wrap gap-4 text-sm">
                    <div>
                      <p className="text-zinc-500">Total mensuel</p>
                      <p className="text-lg font-semibold">
                        {formatIdr(villa.prixTotal)}
                      </p>
                    </div>
                    <div>
                      <p className="text-zinc-500">Par personne</p>
                      <p className="text-lg font-semibold">
                        {formatIdr(villa.prixParPersonne)}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <span className="rounded-full border border-white/15 px-3 py-1 text-xs text-zinc-300">
                      Piscine & wifi
                    </span>
                    <span className="rounded-full border border-white/15 px-3 py-1 text-xs text-zinc-300">
                      Group chat actif
                    </span>
                    <span className="rounded-full border border-white/15 px-3 py-1 text-xs text-zinc-300">
                      Frais booking inclus
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => router.push(`/villa/${villa.id}`)}
                      className="flex-1 rounded-2xl bg-white text-black py-3 font-semibold"
                    >
                      Voir la villa
                    </button>
                    <button className="rounded-2xl border border-white/20 px-4 py-3 text-sm text-zinc-300">
                      Partager
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}








