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
  vibe: string;
  adresse: string;
  regles: string[];
};

type Message = {
  id: string;
  text: string;
  author: string;
  time: string;
};

const initialMessages: Message[] = [
  { id: "1", text: "Salut ! Je bosse sur un projet ecom, dispo pour surf matin.", author: "Marie", time: "09:45" },
  { id: "2", text: "On fait un diner jeudi pour accueillir les nouveaux ?", author: "Thomas", time: "10:10" },
];

export default function GroupPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { bookingData } = useStore();
  const [villa, setVilla] = useState<Villa | null>(null);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    const hasBooking =
      bookingData?.paid ||
      (() => {
        if (typeof window === "undefined") return false;
        const stored = localStorage.getItem("bookingData");
        if (!stored) return false;
        try {
          return JSON.parse(stored).paid;
        } catch {
          return false;
        }
      })();

    if (!hasBooking) {
      router.push(`/booking/${params.id}`);
      return;
    }

    const found = (villas as Villa[]).find((v) => v.id === params.id);
    if (found) {
      setVilla(found);
    } else {
      router.push("/villas");
    }
  }, [params.id, router, bookingData]);

  const vibeColor = useMemo(() => {
    switch (villa?.vibe) {
      case "Work":
        return "bg-sky-500/20 text-sky-200";
      case "Chill":
        return "bg-teal-500/20 text-teal-200";
      case "Party":
        return "bg-pink-500/20 text-pink-200";
      default:
        return "bg-purple-500/20 text-purple-200";
    }
  }, [villa?.vibe]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    const message: Message = {
      id: Date.now().toString(),
      text: newMessage,
      author: "Moi",
      time: new Date().toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    setMessages((prev) => [...prev, message]);
    setNewMessage("");
  };

  if (!villa) {
    return (
      <main className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
        <p className="text-zinc-400">Chargement du groupe...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-5xl mx-auto px-6 py-10 space-y-10">
        <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-zinc-500">
          <Link href={`/villa/${villa.id}`} className="hover:text-white">
            {"<-"} Retour a la villa
          </Link>
          <span>Etape 3 sur 3 - Community</span>
        </div>

        <header className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">
                Groupe prive
              </p>
              <h1 className="text-3xl md:text-4xl font-semibold">{villa.nom}</h1>
              <p className="text-zinc-400 mt-2">
                Tu as debloque l'adresse et le chat pour coordonner ton arrivee avec la coloc.
              </p>
            </div>
            <div className={`rounded-full px-4 py-2 text-sm font-semibold ${vibeColor}`}>
              Vibe {villa.vibe}
            </div>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[1.1fr,1.4fr]">
          <div className="space-y-6">
            <div className="rounded-3xl border border-white/10 bg-zinc-900/60 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Adresse detaillee</h2>
                <span className="text-xs uppercase tracking-[0.3em] text-zinc-500">
                  visible uniquement ici
                </span>
              </div>
              <p className="text-sm text-zinc-300 leading-relaxed">{villa.adresse}</p>
              <div className="rounded-2xl border border-dashed border-white/15 p-4 text-xs text-zinc-500">
                Merci de ne pas partager cette adresse en public. Utilise le chat pour coordonner les taxis et arrivees.
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-zinc-900/60 p-6 space-y-4">
              <h2 className="text-xl font-semibold">Rappels maison</h2>
              <ul className="space-y-3 text-sm text-zinc-300">
                {villa.regles.map((rule) => (
                  <li key={rule} className="flex items-start gap-3">
                    <span className="text-white/40 text-lg">-</span>
                    {rule}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-zinc-900/60 flex flex-col">
            <div className="border-b border-white/10 p-6">
              <h2 className="text-xl font-semibold">Chat des colocs</h2>
              <p className="text-sm text-zinc-400 mt-1">
                Partage ton heure d'arrivee, propose des sorties ou pose tes questions.
              </p>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.author === "Moi" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[70%] rounded-2xl px-4 py-3 text-sm ${
                      message.author === "Moi"
                        ? "bg-white text-black"
                        : "bg-white/10 text-white"
                    }`}
                  >
                    <p className="font-semibold">{message.author}</p>
                    <p className="mt-1">{message.text}</p>
                    <p
                      className={`text-xs mt-1 ${
                        message.author === "Moi" ? "text-black/60" : "text-white/60"
                      }`}
                    >
                      {message.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-white/10 p-6">
              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Ecris un message..."
                  className="flex-1 rounded-2xl border border-white/15 bg-transparent px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-white/30"
                />
                <button
                  onClick={handleSendMessage}
                  className="rounded-2xl bg-white text-black px-6 py-3 font-semibold"
                >
                  Envoyer
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}








