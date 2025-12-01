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
  prixParPersonne: number;
  vibe: string;
};

const BOOKING_FEE_EUR = 25;
const formatIdr = (value: number) =>
  new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);

export default function BookingPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { setBookingData, onboardingData } = useStore();
  const [villa, setVilla] = useState<Villa | null>(null);
  const [arrivalDate, setArrivalDate] = useState("");
  const [message, setMessage] = useState("");
  const [agree, setAgree] = useState(false);

  useEffect(() => {
    const found = (villas as Villa[]).find((v) => v.id === params.id);
    if (found) {
      setVilla(found);
    } else {
      router.push("/villas");
    }

    if (onboardingData?.arrivalDate) {
      setArrivalDate(onboardingData.arrivalDate);
    }
  }, [params.id, router, onboardingData]);

  const dueLater = useMemo(() => {
    if (!villa) return "";
    const remainder = Math.max(villa.prixParPersonne - BOOKING_FEE_EUR * 17000, 0);
    return formatIdr(remainder);
  }, [villa]);

  const handlePayment = () => {
    if (!villa || !agree) return;
    const booking = {
      villaId: villa.id,
      villaName: villa.nom,
      prixParPersonne: villa.prixParPersonne,
      vibe: villa.vibe,
      dates: arrivalDate || "A definir",
      bookingFee: BOOKING_FEE_EUR,
      paid: true,
    };
    setBookingData(booking);
    localStorage.setItem("bookingData", JSON.stringify(booking));
    router.push(`/group/${villa.id}`);
  };

  if (!villa) {
    return (
      <main className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
        <p className="text-zinc-400">Chargement...</p>
      </main>
    );
  }

  const canPay = agree && Boolean(arrivalDate);

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-5xl mx-auto px-6 py-10 space-y-10">
        <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-zinc-500">
          <Link href={`/villa/${villa.id}`} className="hover:text-white">
            {"<-"} Retour a la fiche villa
          </Link>
          <p>Etape 2 sur 3 - Reservation</p>
        </div>

        <header className="space-y-3">
          <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">
            Valide ta place
          </p>
          <h1 className="text-3xl md:text-4xl font-semibold">
            {villa.nom} - {villa.zone}
          </h1>
          <p className="text-zinc-400">
            Paye le fee de reservation pour bloquer une chambre et acceder au
            groupe prive de la coloc.
          </p>
        </header>

        <section className="grid gap-6 lg:grid-cols-[1.5fr,1fr]">
          <div className="space-y-6">
            <div className="rounded-3xl border border-white/10 bg-zinc-900/60 p-6 space-y-4">
              <h2 className="text-xl font-semibold">Recap</h2>
              <div className="grid gap-4 sm:grid-cols-2 text-sm">
                <div className="rounded-2xl border border-white/10 p-4">
                  <p className="text-zinc-500 mb-1">Prix par personne</p>
                  <p className="text-xl font-semibold">
                    {formatIdr(villa.prixParPersonne)}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 p-4">
                  <p className="text-zinc-500 mb-1">Ambiance</p>
                  <p className="text-xl font-semibold">{villa.vibe}</p>
                </div>
                <div className="rounded-2xl border border-white/10 p-4">
                  <p className="text-zinc-500 mb-1">Arrivee</p>
                  <input
                    type="date"
                    value={arrivalDate}
                    onChange={(e) => setArrivalDate(e.target.value)}
                    className="w-full bg-transparent text-sm border border-white/10 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-white/30"
                  />
                </div>
                <div className="rounded-2xl border border-white/10 p-4">
                  <p className="text-zinc-500 mb-1">Message au groupe</p>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Parle de ton projet ou de ta vibe..."
                    rows={3}
                    className="w-full bg-transparent text-sm border border-white/10 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-white/30"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-zinc-900/60 p-6 space-y-4">
              <h2 className="text-xl font-semibold">Ce que tu debloques</h2>
              <ul className="space-y-3 text-sm text-zinc-300">
                {[
                  "Acces instantane au groupe chat de la coloc",
                  "Adresse exacte + guide d'arrivee",
                  "Support villa manager pour coordonner ton arrivee",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="text-white/50 text-lg">-</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <label className="flex items-start gap-3 text-sm text-zinc-300">
              <input
                type="checkbox"
                checked={agree}
                onChange={() => setAgree((prev) => !prev)}
                className="mt-1"
              />
              <span>
                Je confirme garder cette place au moins 48h et j'ai compris que
                le fee de {BOOKING_FEE_EUR} EUR est non remboursable.
              </span>
            </label>
          </div>

          <aside className="rounded-3xl border border-white/10 bg-zinc-900/60 p-6 space-y-5">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">
                Due aujourd'hui
              </p>
              <p className="text-4xl font-semibold text-white">
                {BOOKING_FEE_EUR} EUR
              </p>
            </div>
            <div className="border-t border-white/10 pt-4 text-sm text-zinc-300 space-y-2">
              <p>Solde a regler a ton arrivee: {dueLater}</p>
              <p className="text-xs text-zinc-500">
                Conversion approximative. Le solde restera en IDR.
              </p>
            </div>
            <button
              onClick={handlePayment}
              disabled={!canPay}
              className={`w-full rounded-full py-4 font-semibold ${
                canPay
                  ? "bg-white text-black hover:bg-zinc-200"
                  : "bg-white/20 text-zinc-400 cursor-not-allowed"
              }`}
            >
              Payer et rejoindre le groupe
            </button>
            <p className="text-xs text-zinc-500">
              Paiement securise via Stripe. Aucune carte n'est debitee apres le
              montant indique.
            </p>
          </aside>
        </section>
      </div>
    </main>
  );
}








