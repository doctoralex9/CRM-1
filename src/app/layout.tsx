import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin", "greek"] });

export const metadata: Metadata = {
  title: "CRM - Επισκευή Αντλιών Πλοίων",
  description: "Σύστημα διαχείρισης πελατών και προσφορών",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="el">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
