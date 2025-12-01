import Link from "next/link";
import villas from "@/data/villas.json";

type Villa = {
  id: string;
  nom: string;
  zone: string;
  prixParPersonne: number;
  vibe: string;
  photos: string[];
  description: string;
};

const featuredVillas: Villa[] = villas.slice(0, 3);

const steps = [
  {
    title: "Partage ton profil",
    description:
      "Renseigne tes dates, ton budget et ton ambiance pour que l'on connaisse ta vibe.",
  },
  {
    title: "On te matche",
    description:
      "Notre algorithme filtre les villas compatibles et t'indique les colocs qui y vivent.",
  },
  {
    title: "Visite et booke",
    description:
      "Visite virtuellement, parle au groupe puis confirme ta place en quelques clics.",
  },
];

const stats = [
  { value: "120+", label: "colocs creees avec succes" },
  { value: "5 zones", label: "principales couvertes a Bali" },
  { value: "<72h", label: "pour trouver ta villa" },
];

const formatIdr = (value: number) =>
  new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white">
      <section
        className="relative overflow-hidden"
        style={{ backgroundImage: `url(${featuredVillas[0].photos[0]})` }}
      >
        <div className="absolute inset-0 bg-black/80" />
        <div className="relative max-w-6xl mx-auto px-6 lg:px-12 py-16 md:py-24 flex flex-col items-center text-center space-y-8">
          <h1 className="text-5xl md:text-6xl font-semibold leading-tight text-white">
            Trouve ta coloc ideale a Bali.
            <br />
            Matching vibe + budget en quelques minutes.
          </h1>
          <p className="text-lg text-white/80 leading-relaxed max-w-[700px]">
            On te connecte a des villas premium, des colocs compatibles avec ton style
            et une communaute d'expats installes a Bali.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/onboarding"
              className="bg-white text-black px-6 py-3 rounded-full font-semibold"
            >
              Commencer maintenant
            </Link>
            <Link
              href="/villas"
              className="border border-white/40 px-6 py-3 rounded-full font-semibold text-white"
            >
              Voir les villas
            </Link>
          </div>

          <div className="flex flex-wrap justify-center gap-6 w-full">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="flex-1 min-w-[180px] max-w-[220px] rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md px-6 py-4"
              >
                <p className="text-2xl font-semibold text-white">{stat.value}</p>
                <p className="text-sm text-white/80">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-16 max-w-6xl mx-auto lg:px-12">
        <h2 className="text-2xl md:text-3xl font-semibold mb-4">
          Pourquoi Bali Coloc ?
        </h2>
        <p className="text-zinc-400 mb-10">
          On gere la pre-selection, la compatibilite des colocs et la paperasse. Tu te
          concentres sur ton aventure a Bali.
        </p>
        <div className="grid gap-6 md:grid-cols-3">
          {steps.map((step) => (
            <div
              key={step.title}
              className="p-6 rounded-2xl bg-zinc-900 border border-white/10 space-y-3"
            >
              <h3 className="text-xl font-semibold">{step.title}</h3>
              <p className="text-zinc-400 text-sm">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-6 py-16 bg-zinc-950">
        <div className="max-w-6xl mx-auto lg:px-12">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-10">
            <div>
              <p className="text-sm tracking-[0.3em] uppercase text-zinc-500">
                Villas populaires
              </p>
              <h2 className="text-2xl md:text-3xl font-semibold">
                Nos coups de coeur du moment
              </h2>
            </div>
            <Link
              href="/villas"
              className="text-white border border-white/30 px-5 py-2 rounded-full text-sm"
            >
              Voir toutes les villas
            </Link>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {featuredVillas.map((villa) => (
              <div
                key={villa.id}
                className="rounded-3xl overflow-hidden border border-white/10 bg-zinc-900/60"
              >
                <div className="h-52 bg-cover bg-center" style={{ backgroundImage: `url(${villa.photos[0]})` }} />
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between text-sm text-zinc-400">
                    <span>{villa.zone}</span>
                    <span className="font-medium text-white">{villa.vibe}</span>
                  </div>
                  <h3 className="text-xl font-semibold">{villa.nom}</h3>
                  <p className="text-sm text-zinc-400">{villa.description}</p>
                  <div>
                    <p className="text-2xl font-bold">{formatIdr(villa.prixParPersonne)}</p>
                    <p className="text-xs text-zinc-500">par personne / mois</p>
                  </div>
                  <Link
                    href={`/villa/${villa.id}`}
                    className="block text-center bg-white text-black py-3 rounded-2xl font-semibold"
                  >
                    Decouvrir la villa
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-16 max-w-5xl mx-auto text-center space-y-6">
        <h2 className="text-3xl font-semibold">Pret a rencontrer ta future coloc ?</h2>
        <p className="text-zinc-400 max-w-2xl mx-auto">
          En trois etapes, tu passes de "je pense venir a Bali" a "je vis dans une villa
          qui me ressemble avec des colocs alignes sur mes envies".
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href="/onboarding"
            className="bg-white text-black px-6 py-3 rounded-full font-semibold"
          >
            Lancer mon matching
          </Link>
          <Link
            href="/group/1"
            className="px-6 py-3 rounded-full border border-white/30"
          >
            Parler a un conseiller
          </Link>
          <Link
            href="/owner/login"
            className="px-6 py-3 rounded-full border border-white/30 text-white/80"
          >
            Publier ma villa
          </Link>
        </div>
      </section>
    </main>
  );
}

