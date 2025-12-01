import { ReactNode } from "react";

type AuthCardProps = {
  title: string;
  description: string;
  footer?: ReactNode;
  children: ReactNode;
};

export function AuthCard({ title, description, footer, children }: AuthCardProps) {
  return (
    <div className="w-full max-w-md rounded-3xl border border-white/10 bg-zinc-900/70 p-8 text-white shadow-2xl shadow-black/40">
      <div className="mb-8 space-y-2">
        <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">Espace proprietaire</p>
        <h1 className="text-3xl font-semibold">{title}</h1>
        <p className="text-zinc-400">{description}</p>
      </div>
      <div className="space-y-4">{children}</div>
      {footer && <div className="mt-6 text-sm text-zinc-400">{footer}</div>}
    </div>
  );
}
