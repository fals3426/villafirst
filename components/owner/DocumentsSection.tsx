"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UploadDropzone } from "@uploadthing/react";

type DocumentsSectionProps = {
  villaId: string;
  initialDocuments: string[];
  disabled?: boolean;
  title?: string;
  description?: string;
};

export function DocumentsSection({
  villaId,
  initialDocuments,
  disabled = false,
  title = "Documents officiels",
  description = "Ajoute ton bail, acte de propriete ou tout document prouvant que tu as le droit de sous-louer ce bien. Formats acceptes : PDF, JPG, PNG.",
}: DocumentsSectionProps) {
  const router = useRouter();
  const [documents, setDocuments] = useState(initialDocuments);
  const [error, setError] = useState("");

  const refreshDocuments = (docs: string[]) => {
    setDocuments(docs);
    router.refresh();
  };

  const handleDelete = async (url: string) => {
    try {
      const response = await fetch(`/api/owner/villas/${villaId}/documents`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentUrl: url }),
      });
      if (!response.ok) throw new Error("Suppression impossible");
      const data = await response.json();
      refreshDocuments(data.documents);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur reseau");
    }
  };

  const onUploadComplete = async (res: { url: string }[] | undefined) => {
    if (!res?.length) return;
    try {
      for (const file of res) {
        const response = await fetch(`/api/owner/villas/${villaId}/documents`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ documentUrl: file.url }),
        });
        if (!response.ok) throw new Error("Sauvegarde impossible");
        const data = await response.json();
        refreshDocuments(data.documents);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur reseau");
    }
  };

  return (
    <section className="space-y-4 rounded-3xl border border-white/10 bg-zinc-900/60 p-6">
      <div className="space-y-2">
        <h3 className="text-xl font-semibold text-white">{title}</h3>
        <p className="text-sm text-zinc-400">{description}</p>
      </div>
      {disabled ? (
        <p className="text-sm text-zinc-500">
          Tu pourras importer tes documents officiels apres avoir sauvegarde la villa.
        </p>
      ) : (
        <>
          <UploadDropzone
            endpoint="villaDocuments"
            appearance={{
              button: "bg-white text-black rounded-full px-4 py-2 text-sm font-semibold",
              dropzone: "border border-dashed border-white/20 bg-black/30 text-white",
            }}
            onClientUploadComplete={onUploadComplete}
            onUploadError={(err) => setError(err.message)}
          />
          {error && <p className="text-sm text-red-400">{error}</p>}
          {documents.length > 0 ? (
            <ul className="space-y-3">
              {documents.map((doc) => (
                <li
                  key={doc}
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white"
                >
                  <span className="truncate">{doc}</span>
                  <button
                    type="button"
                    onClick={() => handleDelete(doc)}
                    className="text-xs text-red-300 underline"
                  >
                    Supprimer
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-zinc-500">Aucun document ajoute pour le moment.</p>
          )}
        </>
      )}
    </section>
  );
}
