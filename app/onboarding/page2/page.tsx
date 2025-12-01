"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { OnboardingData, useStore } from "@/lib/store";

type Zone = {
  name: string;
  vibe: string;
  description: string;
};

type DurationChoice = {
  label: string;
  hint: string;
};

const zoneOptions: Zone[] = [
  {
    name: "Canggu",
    vibe: "surf & cafes",
    description: "Communaute nomade active, beach clubs et coworkings partout.",
  },
  {
    name: "Pererenan",
    vibe: "slow chill",
    description: "Village calme a 5 min de la plage, parfait pour se poser.",
  },
  {
    name: "Umalas",
    vibe: "mix",
    description: "Entre Seminyak et Canggu, acces rapide aux meilleurs spots.",
  },
  {
    name: "Seminyak",
    vibe: "party",
    description: "Vie nocturne, restos et concept stores pour sortir chaque soir.",
  },
  {
    name: "Ubud",
    vibe: "zen",
    description: "Rizieres, temples et studios yoga pour reset ton mindset.",
  },
];

const durationOptions: DurationChoice[] = [
  { label: "1 mois", hint: "test Bali" },
  { label: "2-3 mois", hint: "on s'installe" },
  { label: "3-6 mois", hint: "base stable" },
  { label: "Long terme", hint: "je m'installe" },
];

const budgetMarks = [5000000, 8000000, 11000000, 14000000];

const getStoredOnboarding = (): OnboardingData | null => {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("onboardingData");
  return raw ? JSON.parse(raw) : null;
};

const formatBudget = (value: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "IDR" }).format(value);

export default function OnboardingPage2() {
  const router = useRouter();
  const { onboardingData, setOnboardingData } = useStore();
  const resolvedData = useMemo(
    () => onboardingData ?? getStoredOnboarding(),
    [onboardingData]
  );

  const [arrivalDate, setArrivalDate] = useState("");
  const [budget, setBudget] = useState(8000000);
  const [zones, setZones] = useState<string[]>([]);
  const [duration, setDuration] = useState("");

  useEffect(() => {
    if (!resolvedData) return;
    if (resolvedData.arrivalDate) setArrivalDate(resolvedData.arrivalDate);
    if (resolvedData.budget) setBudget(resolvedData.budget);
    if (resolvedData.zones?.length) setZones(resolvedData.zones);
    if (resolvedData.duration) setDuration(resolvedData.duration);
  }, [resolvedData]);

  const toggleZone = (zone: string) => {
    setZones((prev) => {
      if (prev.includes(zone)) return prev.filter((z) => z !== zone);
      if (prev.length >= 3) return prev;
      return [...prev, zone];
    });
  };

  const arrivalLabel = useMemo(() => {
    if (!arrivalDate) return "choisis ta date";
    return new Intl.DateTimeFormat("fr-FR", {
      day: "numeric",
      month: "long",
    }).format(new Date(arrivalDate));
  }, [arrivalDate]);

  const budgetEuro = useMemo(() => Math.round(budget / 16500), [budget]);
  const isReady = arrivalDate.trim().length > 0 && zones.length > 0 && Boolean(duration);

  const handleSubmit = async () => {
    const merged = { ...(resolvedData ?? {}), arrivalDate, budget, zones, duration };
    setOnboardingData(merged);
    if (typeof window !== "undefined") {
      localStorage.setItem("onboardingData", JSON.stringify(merged));
    }
    try {
      const response = await fetch("/api/me/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(merged),
      });
      if (!response.ok) {
        console.warn("Endpoint /api/me/preferences non dispo");
      }
    } catch (error) {
      console.error("Sync preferences skipped", error);
    }
    router.push("/villas");
  };

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-5xl mx-auto px-6 py-12 space-y-10">
        <header className="space-y-4">
          <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">Step 2/2</p>
          <h1 className="text-3xl md:text-4xl font-semibold">Personnalise ton sejour a Bali</h1>
          <p className="text-zinc-400 max-w-2xl">
            Dates, budget, zones preferees et duree. On calcule tes matchs et on t'affiche les colocs dispo.
          </p>
        </header>

        <section className="grid gap-6 md:grid-cols-[2fr,1fr]">
          <div className="space-y-6">
            <div className="rounded-3xl border border-white/10 bg-zinc-900/60 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Dates d'arrivee</h2>
                <span className="text-sm text-zinc-500">{arrivalLabel}</span>
              </div>
              <input
                type="date"
                value={arrivalDate}
                onChange={(e) => setArrivalDate(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-transparent px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-white/30"
              />
              <p className="text-xs text-zinc-500">
                Arrive un jeudi ou dimanche, tu rejoindras le groupe plus facilement.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-zinc-900/60 p-6 space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h2 className="text-xl font-semibold">Budget mensuel</h2>
                <span className="text-sm text-zinc-400 font-medium">
                  {formatBudget(budget)} (~{budgetEuro} EUR)
                </span>
              </div>
              <input
                type="range"
                min={4000000}
                max={16000000}
                step={100000}
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                className="w-full accent-white"
              />
              <div className="flex justify-between text-xs text-zinc-500">
                {budgetMarks.map((mark) => (
                  <span key={mark}>{mark / 1000000}M</span>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {["Work", "Chill", "Party"].map((label) => (
                  <span
                    key={label}
                    className="rounded-full border border-white/10 px-3 py-1 text-xs text-zinc-400"
                  >
                    {label} friendly
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-zinc-900/60 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Zones preferees</h2>
                <span className="text-xs text-zinc-500">Choisis jusqu'a 3 zones pour matcher vite.</span>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {zoneOptions.map((zone) => {
                  const selected = zones.includes(zone.name);
                  return (
                    <button
                      key={zone.name}
                      onClick={() => toggleZone(zone.name)}
                      className={`rounded-2xl border px-4 py-4 text-left transition ${
                        selected ? "border-white bg-white text-black" : "border-white/10 bg-transparent"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-lg font-semibold">{zone.name}</p>
                        <span className="text-xs uppercase tracking-wide text-zinc-400">{zone.vibe}</span>
                      </div>
                      <p className={`mt-2 text-sm ${selected ? "text-black/70" : "text-zinc-400"}`}>
                        {zone.description}
                      </p>
                    </button>
                  );
                })}
              </div>
              {zones.length >= 3 && (
                <p className="text-xs text-amber-400">Tu peux deselectionner une zone pour en ajouter une autre.</p>
              )}
            </div>

            <div className="rounded-3xl border border-white/10 bg-zinc-900/60 p-6 space-y-4">
              <h2 className="text-xl font-semibold">Duree du sejour</h2>
              <div className="flex flex-wrap gap-3">
                {durationOptions.map((choice) => {
                  const active = duration === choice.label;
                  return (
                    <button
                      key={choice.label}
                      onClick={() => setDuration(choice.label)}
                      className={`rounded-2xl border px-5 py-3 text-left transition ${
                        active ? "border-white bg-white text-black" : "border-white/10 text-white"
                      }`}
                    >
                      <p className="text-base font-semibold">{choice.label}</p>
                      <p className={`text-xs ${active ? "text-black/70" : "text-zinc-400"}`}>{choice.hint}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <aside className="space-y-4">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 space-y-4">
              <h3 className="text-lg font-semibold">Ton brief</h3>
              <ul className="space-y-3 text-sm text-zinc-300">
                <li>
                  <span className="text-zinc-500">Arrivee :</span> {arrivalDate ? arrivalLabel : "A definir"}
                </li>
                <li>
                  <span className="text-zinc-500">Budget :</span> {formatBudget(budget)} / mois
                </li>
                <li>
                  <span className="text-zinc-500">Zones :</span>{" "}
                  {zones.length ? zones.join(", ") : "A precisier"}
                </li>
                <li>
                  <span className="text-zinc-500">Duree :</span> {duration || "A precisier"}
                </li>
                <li>
                  <span className="text-zinc-500">Vibe :</span> {resolvedData?.vibe || "A definir"}
                </li>
              </ul>
              <p className="text-xs text-zinc-500">
                On partage ce brief avec nos villa managers pour te proposer les meilleurs slots de visite.
              </p>
            </div>

            <div className="rounded-3xl border border-dashed border-white/20 p-5 text-sm text-zinc-400 space-y-3">
              <p className="font-semibold text-white">Besoin d'aide ?</p>
              <p>Nos conseillers peuvent ajuster dates et budget en fonction de ton style de vie.</p>
              <button className="text-white underline underline-offset-4">Book un call express</button>
            </div>

            <button
              onClick={handleSubmit}
              disabled={!isReady}
              className={`w-full rounded-full py-4 text-center text-lg font-semibold transition ${
                isReady ? "bg-white text-black hover:bg-zinc-200" : "bg-white/20 text-zinc-500 cursor-not-allowed"
              }`}
            >
              Voir mes colocs compatibles
            </button>
          </aside>
        </section>
      </div>
    </main>
  );
}
