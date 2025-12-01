import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthCard } from "@/components/owner/AuthCard";
import { LoginForm } from "@/components/owner/LoginForm";
import { getOwnerFromSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function OwnerLoginPage() {
  const session = getOwnerFromSession();
  if (session) {
    const owner = await prisma.owner.findUnique({
      where: { id: session.ownerId },
      select: { profileCompleted: true },
    });

    if (owner?.profileCompleted) {
      redirect("/owner/dashboard");
    } else {
      redirect("/owner/onboarding");
    }
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center">
      <AuthCard
        title="Connexion proprietaire"
        description="Accede a ton tableau de bord et gere tes villas."
        footer={
          <p>
            Nouveau sur Bali Coloc ?{" "}
            <Link href="/owner/register" className="text-white underline">
              Cree un acces
            </Link>
          </p>
        }
      >
        <LoginForm />
      </AuthCard>
    </div>
  );
}
