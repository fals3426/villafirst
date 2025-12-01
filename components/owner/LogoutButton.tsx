"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { OwnerButton } from "./Button";

export function LogoutButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleLogout = async () => {
    await fetch("/api/owner/logout", { method: "POST" });
    startTransition(() => {
      router.push("/owner/login");
      router.refresh();
    });
  };

  return (
    <OwnerButton variant="outline" loading={isPending} onClick={handleLogout}>
      Se deconnecter
    </OwnerButton>
  );
}
