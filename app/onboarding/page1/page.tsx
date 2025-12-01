"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { OnboardingData, useStore } from "@/lib/store";

const vibeOptions = [
  { value: "Work friendly", label: "Work friendly", hint: "Wifi solide, ambiance studieuse" },
  { value: "Chill", label: "Chill", hint: "Brunch, sunset et rythme tranquille" },
  { value: "Party", label: "Party", hint: "Clubs, events et sorties regulieres" },
];

const lifestyleOptions = [
  { value: "Remote worker", label: "Remote worker" },
  { value: "Sportif", label: "Sportif" },
  { value: "Social", label: "Social" },
  { value: "Creatif", label: "Creatif" },
  { value: "Casanier", label: "Casanier" },
];

const rythmeOptions = [
  { value: "Tres calme", label: "Tres calme" },
  { value: "Equilibre", label: "Equilibre" },
  { value: "Festif", label: "Festif" },
];

const getStoredOnboarding = (): OnboardingData | null => {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("onboardingData");
  return raw ? JSON.parse(raw) : null;
};

export default function OnboardingPage1() {
  const router = useRouter();
  const { onboardingData, setOnboardingData } = useStore();
  const [vibe, setVibe] = useState("");
  const [lifestyle, setLifestyle] = useState<string[]>([]);
  const [rythme, setRythme] = useState("");
  const resolvedData = useMemo(
    () => onboardingData ?? getStoredOnboarding(),
    [onboardingData]
  );

  useEffect(() => {
    if (!resolvedData) return;
    if (resolvedData.vibe) setVibe(resolvedData.vibe);
    if (resolvedData.lifestyle?.length) setLifestyle(resolvedData.lifestyle);
    if (resolvedData.rythme) setRythme(resolvedData.rythme);
  }, [resolvedData]);

  const toggleLifestyle = (value: string) => {
    setLifestyle((prev) =>
      prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]
    );
  };

  const saveAndContinue = async () => {
    const merged = { ...(resolvedData ?? {}), vibe, lifestyle, rythme };
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
    router.push("/onboarding/page2");
  };

  const canContinue = vibe.trim().length > 0 && lifestyle.length > 0 && rythme.trim().length > 0;

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-5xl mx-auto px-6 py-12 space-y-10">
        <header className="space-y-4">
          <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">Step 1/2</p>
          <h1 className="text-3xl md:text-4xl font-semibold">Trouve la coloc qui te ressemble</h1>
          <p className="text-zinc-400 max-w-2xl">
            Choisis ta vibe et ton style de vie pour que l'on personnalise ton arrivee et tes futurs colocs.
          </p>
        </header>

        <section className="grid gap-6 md:grid-cols-[2fr,1fr]">
          <div className="space-y-6">
            <div className="rounded-3xl border border-white/10 bg-zinc-900/60 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Vibe</h2>
                <span className="text-xs text-zinc-500">Selection obligatoire</span>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                {vibeOptions.map((option) => {
                  const active = vibe === option.value;
                  return (
                    <button
                      key={option.value}
                      onClick={() => setVibe(option.value)}
                      className={`rounded-2xl border px-4 py-4 text-left transition ${
                        active ? "bg-white text-black border-white" : "border-white/15"
                      }`}
                    >
                      <p className="text-lg font-semibold">{option.label}</p>
                      <p className={`text-sm mt-1 ${active ? "text-black/70" : "text-zinc-400"}`}>
                        {option.hint}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-zinc-900/60 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Style de vie</h2>
                <span className="text-xs text-zinc-500">Multi-choix</span>
              </div>
              <div className="flex flex-wrap gap-3">
                {lifestyleOptions.map((option) => {
                  const active = lifestyle.includes(option.value);
                  return (
                    <button
                      key={option.value}
                      onClick={() => toggleLifestyle(option.value)}
                      className={`rounded-full border px-4 py-2 text-sm ${
                        active ? "bg-white text-black border-white" : "border-white/15 text-white"
                      }`}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-zinc-900/60 p-6 space-y-4">
              <h2 className="text-xl font-semibold">Rythme</h2>
              <div className="flex flex-wrap gap-3">
                {rythmeOptions.map((option) => {
                  const active = rythme === option.value;
                  return (
                    <button
                      key={option.value}
                      onClick={() => setRythme(option.value)}
                      className={`rounded-2xl border px-5 py-3 text-left transition ${
                        active ? "bg-white text-black border-white" : "border-white/15 text-white"
                      }`}
                    >
                      <p className="text-base font-semibold">{option.label}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <aside className="space-y-4">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 space-y-3">
              <h3 className="text-lg font-semibold">Ton brief</h3>
              <ul className="space-y-2 text-sm text-zinc-300">
                <li>
                  <span className="text-zinc-500">Vibe :</span> {vibe || "A definir"}
                </li>
                <li>
                  <span className="text-zinc-500">Style de vie :</span>{" "}
                  {lifestyle.length ? lifestyle.join(", ") : "Choisis 1 ou +"}
                </li>
                <li>
                  <span className="text-zinc-500">Rythme :</span> {rythme || "A definir"}
                </li>
              </ul>
              <p className="text-xs text-zinc-500">
                On partage ce brief avec nos villa managers pour matcher ton style.
              </p>
            </div>

            <div className="rounded-3xl border border-dashed border-white/20 p-5 text-sm text-zinc-400 space-y-3">
              <p className="font-semibold text-white">Besoin d'aide ?</p>
              <p>On peut te recommander la vibe et la zone ideale selon ton rythme.</p>
              <button className="text-white underline underline-offset-4">Book un call express</button>
            </div>

            <button
              onClick={saveAndContinue}
              disabled={!canContinue}
              className={`w-full rounded-full py-4 text-center text-lg font-semibold transition ${
                canContinue ? "bg-white text-black hover:bg-zinc-200" : "bg-white/20 text-zinc-500 cursor-not-allowed"
              }`}
            >
              Continuer
            </button>
          </aside>
        </section>
      </div>
    </main>
  );
}
