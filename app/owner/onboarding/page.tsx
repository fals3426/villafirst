import { redirect } from "next/navigation";
import Link from "next/link";
import { getOwnerFromSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { OwnerProfileForm } from "@/components/owner/OwnerProfileForm";

export default async function OwnerOnboardingPage() {
  const session = getOwnerFromSession();
  if (!session) {
    redirect("/owner/login");
  }

  const owner = await prisma.owner.findUnique({ where: { id: session.ownerId } });
  if (!owner) {
    redirect("/owner/login");
  }

  if (owner.profileCompleted) {
    redirect("/owner/dashboard");
  }

  return (
    <div className="space-y-8 text-white">
      <div className="space-y-3">
        <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">Bienvenue</p>
        <h1 className="text-3xl font-semibold">Finalise ton profil proprietaire</h1>
        <p className="text-zinc-400 max-w-2xl">
          Ces informations restent confidentielles et nous permettent de verifier ton identite avant
          publication. Tu pourras les modifier plus tard si besoin.
        </p>
      </div>

      <div className="rounded-3xl border border-white/10 bg-zinc-900/60 p-8">
        <OwnerProfileForm
          ownerId={owner.id}
          mode="onboarding"
          initialValues={{
            firstName: owner.firstName ?? "",
            lastName: owner.lastName ?? "",
            personalAddress: owner.personalAddress ?? "",
            nationalIdUrl: owner.nationalIdUrl ?? "",
          }}
        />
      </div>

      <p className="text-sm text-zinc-500">
        Besoin d'aide ?{" "}
        <Link href="/owner/dashboard" className="text-white underline">
          Contacte notre equipe
        </Link>
      </p>
    </div>
  );
}
