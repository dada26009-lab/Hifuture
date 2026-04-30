import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hi Future — Мэргэжлийн зөвлөгөө",
  description: "20 минутын дотор чиний ур чадвар, зан чанар, сонирхолд тохирсон мэргэжлийн зөвлөгөөг аваарай.",
  icons: {
    icon: "/icon.png",
    apple: "/icon.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="mn">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}
