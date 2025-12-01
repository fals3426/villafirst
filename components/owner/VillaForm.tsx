"use client";

import { ChangeEvent, FormEvent, ReactNode, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { OwnerButton } from "./Button";

const ZONES = ["Canggu", "Pererenan", "Seminyak", "Ubud", "Autre"];
const VIBES = ["Work", "Chill", "Mix", "Party"];
const OWNER_TYPES = ["proprietaire", "agence", "sous-locataire", "gestionnaire", "autre"];
type VillaFormProps = {
  mode: "create" | "edit";
  villa?: {
    id: string;
    nom: string;
    zone: string;
    ownerType: string;
    adresseComplete: string;
    chambres: number;
    placesTotal: number;
    prixTotal: number;
    prixParPersonne: number;
    vibe: string;
    description: string;
    photos: string[];
    statut: "PENDING" | "VALIDEE";
  };
};

type SubmitIntent = "documents" | "later" | "edit";

export function VillaForm({ mode, villa }: VillaFormProps) {
  const router = useRouter();
  const [form, setForm] = useState({
    nom: villa?.nom ?? "",
    zone: villa?.zone ?? "Canggu",
    ownerType: villa?.ownerType ?? "proprietaire",
    adresseComplete: villa?.adresseComplete ?? "",
    chambres: villa?.chambres?.toString() ?? "3",
    placesTotal: villa?.placesTotal?.toString() ?? "4",
    prixTotal: villa?.prixTotal?.toString() ?? "0",
    prixParPersonne: villa?.prixParPersonne?.toString() ?? "0",
    vibe: villa?.vibe ?? "Work",
    description: villa?.description ?? "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [photoUrls, setPhotoUrls] = useState<string[]>(villa?.photos ?? []);
  const [submitIntent, setSubmitIntent] = useState<SubmitIntent>(
    mode === "create" ? "documents" : "edit"
  );

  const actionLabel = useMemo(() => (mode === "create" ? "Publier ma villa" : "Mettre a jour"), [mode]);

  const handleFiles = async (files: FileList) => {
    const fileArray = Array.from(files);
    try {
      const images = await Promise.all(fileArray.map(readFileAsDataUrl));
      setPhotoUrls((prev) => [...prev, ...images]);
    } catch {
      setError("Impossible de lire certains fichiers. Essaie un autre format.");
    }
  };

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    const payload = {
      ...form,
      chambres: Number(form.chambres),
      placesTotal: Number(form.placesTotal),
      prixTotal: Number(form.prixTotal),
      prixParPersonne: Number(form.prixParPersonne),
      photos: photoUrls,
    };

    try {
      const response = await fetch(
        mode === "create" ? "/api/owner/villas" : `/api/owner/villas/${villa?.id}`,
        {
          method: mode === "create" ? "POST" : "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message ?? "Erreur lors de l'enregistrement");
      }

      if (mode === "create" && data?.villa?.id) {
        if (submitIntent === "later") {
          router.push("/owner/dashboard?brouillon=1");
        } else {
          router.push(`/owner/villas/${data.villa.id}/documents`);
        }
      } else {
        router.push("/owner/dashboard");
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur reseau");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Nom de la villa">
          <input
            type="text"
            required
            value={form.nom}
            onChange={(e) => handleChange("nom", e.target.value)}
            className="field-input"
          />
        </Field>
        <Field label="Zone">
          <select
            value={form.zone}
            onChange={(e) => handleChange("zone", e.target.value)}
            className="field-input"
          >
            {ZONES.map((zone) => (
              <option key={zone}>{zone}</option>
            ))}
          </select>
        </Field>
        <Field label="Nombre de chambres">
          <input
            type="number"
            min={1}
            value={form.chambres}
            onChange={(e) => handleChange("chambres", e.target.value)}
            className="field-input"
          />
        </Field>
        <Field label="Nombre de places">
          <input
            type="number"
            min={1}
            value={form.placesTotal}
            onChange={(e) => handleChange("placesTotal", e.target.value)}
            className="field-input"
          />
        </Field>
        <Field label="Prix total mensuel (IDR)">
          <input
            type="number"
            min={0}
            value={form.prixTotal}
            onChange={(e) => handleChange("prixTotal", e.target.value)}
            className="field-input"
          />
        </Field>
        <Field label="Prix par personne (IDR)">
          <input
            type="number"
            min={0}
            value={form.prixParPersonne}
            onChange={(e) => handleChange("prixParPersonne", e.target.value)}
            className="field-input"
          />
        </Field>
        <Field label="Vibe">
          <select
            value={form.vibe}
            onChange={(e) => handleChange("vibe", e.target.value)}
            className="field-input"
          >
            {VIBES.map((vibe) => (
              <option key={vibe}>{vibe}</option>
            ))}
          </select>
        </Field>
      </div>

      <OwnerTypeSelector
        value={form.ownerType}
        onChange={(value) => handleChange("ownerType", value)}
      />

      <Field label="Adresse complete (confidentielle)">
        <textarea
          required
          value={form.adresseComplete}
          onChange={(e) => handleChange("adresseComplete", e.target.value)}
          className="field-input h-24"
        />
      </Field>

      <Field label="Description detaillee">
        <textarea
          required
          value={form.description}
          onChange={(e) => handleChange("description", e.target.value)}
          className="field-input h-32"
        />
      </Field>

      <PhotoUploader
        photos={photoUrls}
        onFiles={handleFiles}
        onRemove={(index) => setPhotoUrls((prev) => prev.filter((_, idx) => idx !== index))}
      />

      {error && <p className="text-sm text-red-400">{error}</p>}

      {mode === "edit" && villa?.statut && (
        <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-300">
          Statut actuel :{" "}
          <span className="font-semibold">
            {villa.statut === "VALIDEE" ? "Validee" : "En attente de validation"}
          </span>{" "}
          (modifie par l'equipe Bali Coloc)
        </div>
      )}

      {mode === "edit" ? (
        <OwnerButton
          type="submit"
          loading={loading}
          onClick={() => setSubmitIntent("edit")}
        >
          {actionLabel}
        </OwnerButton>
      ) : (
        <div className="flex flex-col gap-3 md:flex-row">
          <OwnerButton
            type="submit"
            className="md:flex-1"
            loading={loading && submitIntent === "documents"}
            disabled={loading}
            onClick={() => setSubmitIntent("documents")}
          >
            Etape suivante : Ajouter mes documents
          </OwnerButton>
          <OwnerButton
            type="submit"
            variant="outline"
            className="md:flex-1"
            loading={loading && submitIntent === "later"}
            disabled={loading}
            onClick={() => setSubmitIntent("later")}
          >
            Enregistrer et revenir plus tard
          </OwnerButton>
        </div>
      )}
    </form>
  );
}

type FieldProps = {
  label: string;
  children: ReactNode;
};

function Field({ label, children }: FieldProps) {
  return (
    <label className="space-y-2 text-sm text-zinc-300">
      <span>{label}</span>
      {children}
    </label>
  );
}

type PhotoUploaderProps = {
  photos: string[];
  onFiles: (files: FileList) => void;
  onRemove: (index: number) => void;
};

function PhotoUploader({ photos, onFiles, onRemove }: PhotoUploaderProps) {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      onFiles(event.target.files);
      event.target.value = "";
    }
  };

  return (
    <div className="space-y-3">
      <label className="space-y-2 text-sm text-zinc-300">
        <span>Photos (upload depuis ton ordinateur)</span>
        <div className="rounded-2xl border border-dashed border-white/20 bg-white/5 p-6 text-center">
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleChange}
            className="hidden"
            id="villa-photos"
          />
          <label
            htmlFor="villa-photos"
            className="cursor-pointer text-sm font-semibold text-white underline"
          >
            Cliquez pour importer
          </label>
          <p className="mt-2 text-xs text-zinc-500">
            Formats acceptés : jpg, png, heic. 3 photos minimum recommandées.
          </p>
        </div>
      </label>
      {photos.length > 0 && (
        <div className="grid gap-3 md:grid-cols-3">
          {photos.map((photo, index) => (
            <div
              key={index}
              className="relative h-32 w-full overflow-hidden rounded-2xl border border-white/10"
            >
              <img src={photo} alt={`Photo ${index + 1}`} className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => onRemove(index)}
                className="absolute right-2 top-2 rounded-full bg-black/70 px-2 py-1 text-xs text-white"
              >
                Retirer
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

type OwnerTypeSelectorProps = {
  value: string;
  onChange: (value: string) => void;
};

function OwnerTypeSelector({ value, onChange }: OwnerTypeSelectorProps) {
  const labels: Record<string, string> = {
    "proprietaire": "Proprietaire",
    "agence": "Agence",
    "sous-locataire": "Sous-locataire",
    "gestionnaire": "Gestionnaire",
    "autre": "Autre",
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-white">Type de proprietaire</h3>
        <p className="text-sm text-zinc-400">
          Selectionne le profil qui correspond le mieux a ta situation.
        </p>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        {OWNER_TYPES.map((type) => {
          const selected = value === type;
          return (
            <button
              type="button"
              key={type}
              onClick={() => onChange(type)}
              className={`rounded-2xl border px-4 py-4 text-left transition ${
                selected
                  ? "bg-white text-black border-white"
                  : "bg-zinc-900/60 text-white border-white/10 hover:border-white/40"
              }`}
            >
              <p className="text-base font-semibold">{labels[type]}</p>
              {selected && <p className="text-xs text-black/70 mt-1">Selectionne</p>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
