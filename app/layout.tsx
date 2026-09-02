import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Revisa.med — Revisão adaptativa",
  description: "Plataforma local de revisão espaçada para residência médica.",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">{children}</body>
    </html>
  );
}
