"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { OwnerButton } from "./Button";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await fetch("/api/owner/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message ?? "Identifiants invalides");
      }

      router.push("/owner/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de connexion");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm text-zinc-300" htmlFor="email">
          Email pro
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-2xl border border-white/10 bg-transparent px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-white/40"
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm text-zinc-300" htmlFor="password">
          Mot de passe
        </label>
        <input
          id="password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-2xl border border-white/10 bg-transparent px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-white/40"
        />
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
      <OwnerButton type="submit" loading={loading}>
        Se connecter
      </OwnerButton>
    </form>
  );
}
