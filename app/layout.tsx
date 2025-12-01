import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bali Coloc App",
  description: "Trouve ta coloc ideale a Bali",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
