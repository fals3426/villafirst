"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { OwnerButton } from "./Button";

type OwnerProfileFormProps = {
  ownerId: string;
  initialValues?: {
    firstName: string;
    lastName: string;
    personalAddress: string;
    nationalIdUrl: string;
  };
  mode?: "onboarding" | "edit";
};

export function OwnerProfileForm({
  ownerId,
  initialValues = {
    firstName: "",
    lastName: "",
    personalAddress: "",
    nationalIdUrl: "",
  },
  mode = "onboarding",
}: OwnerProfileFormProps) {
  const router = useRouter();
  const [firstName, setFirstName] = useState(initialValues.firstName);
  const [lastName, setLastName] = useState(initialValues.lastName);
  const [personalAddress, setPersonalAddress] = useState(initialValues.personalAddress);
  const [nationalIdUrl, setNationalIdUrl] = useState(initialValues.nationalIdUrl);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    if (!nationalIdUrl) {
      setError("Merci d'uploader ta piece d'identite.");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch("/api/owner/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          personalAddress,
          nationalIdUrl,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message ?? "Impossible d'enregistrer");
      }

      if (mode === "onboarding") {
        router.push("/owner/dashboard");
      } else {
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur reseau");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Prenom">
          <input
            type="text"
            required
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="field-input"
          />
        </Field>
        <Field label="Nom">
          <input
            type="text"
            required
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="field-input"
          />
        </Field>
      </div>

      <Field label="Adresse personnelle">
        <textarea
          required
          value={personalAddress}
          onChange={(e) => setPersonalAddress(e.target.value)}
          className="field-input h-24"
        />
      </Field>

      <div className="space-y-3">
        <h3 className="text-sm text-zinc-300">Piece d'identite (photo ou PDF)</h3>
        <label className="flex items-center justify-between rounded-3xl border border-white/15 bg-black/30 px-6 py-4 text-sm text-white cursor-pointer hover:border-white/40 transition">
          <span>Choisis un fichier (JPG, PNG ou PDF)</span>
          <input
            type="file"
            accept="image/jpeg,image/png,application/pdf"
            className="hidden"
            onChange={async (event) => {
              const file = event.target.files?.[0];
              if (!file) return;
              if (!["image/jpeg", "image/png", "application/pdf"].includes(file.type)) {
                setError("Format non supporte. Utilise JPG, PNG ou PDF.");
                return;
              }
              const reader = new FileReader();
              reader.onloadend = () => {
                setNationalIdUrl(reader.result as string);
                setError("");
              };
              reader.readAsDataURL(file);
            }}
          />
          <span className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-black">
            Importer
          </span>
        </label>
        {nationalIdUrl && (
          <div className="rounded-2xl border border-white/10 bg-black/40 p-4 text-sm text-zinc-400">
            <p className="font-semibold text-white">Fichier ajoute</p>
            {nationalIdUrl.startsWith("data:application/pdf") ? (
              <a href={nationalIdUrl} target="_blank" rel="noreferrer" className="underline">
                Voir le PDF
              </a>
            ) : (
              <img
                src={nationalIdUrl}
                alt="Piece d'identite"
                className="mt-2 h-40 w-auto rounded-xl object-cover"
              />
            )}
            <button
              type="button"
              onClick={() => setNationalIdUrl("")}
              className="mt-3 text-xs text-red-300 underline"
            >
              Supprimer ce fichier
            </button>
          </div>
        )}
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <OwnerButton type="submit" loading={loading}>
        {mode === "onboarding" ? "Valider mon profil" : "Mettre a jour"}
      </OwnerButton>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="space-y-2 text-sm text-zinc-300">
      <span>{label}</span>
      {children}
    </label>
  );
}
