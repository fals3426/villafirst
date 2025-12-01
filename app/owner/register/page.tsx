import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthCard } from "@/components/owner/AuthCard";
import { RegisterForm } from "@/components/owner/RegisterForm";
import { getOwnerFromSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function OwnerRegisterPage() {
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
        title="Creer mon acces proprietaire"
        description="Publie tes villas en quelques minutes et rejoins la communaute Bali Coloc."
        footer={
          <p>
            Deja inscrit ?{" "}
            <Link href="/owner/login" className="text-white underline">
              Connecte-toi ici
            </Link>
          </p>
        }
      >
        <RegisterForm />
      </AuthCard>
    </div>
  );
}
