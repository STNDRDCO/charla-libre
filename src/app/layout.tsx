import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Charla Libre", template: "%s — Charla Libre" },
  description: "Personas que abren un rato de su tiempo para conversar con vos. Gratis, por videollamada, con un tema para empezar.",
  icons: { icon: "/puerta.svg" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-AR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,300..700;1,6..72,300..700&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}
