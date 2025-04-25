// ✅ File: src/app/layout.tsx

import "@/app/globals.css";
import { Metadata } from "next";
import { Inter } from "next/font/google";
import { AuthProvider } from "@/context/AuthContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TrustCrowd©",
  description: "Crowdsourced Software Testing Platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-[#0e0b1e] text-white`}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}