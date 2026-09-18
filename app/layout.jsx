import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/components/LanguageProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

import { Space_Grotesk, DM_Mono } from "next/font/google";

const space = Space_Grotesk({ subsets: ["latin"], variable: "--font-space" });
const mono = DM_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-mono" });
export const metadata = {
  title: "RiverTrade | Digital Asset Investment Platform",
  description: "RiverTrade helps users explore crypto markets, manage investments, and access a modern trading dashboard.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://rivertrade-one.vercel.app"),
};

export default function RootLayout({ children }) {
  return <html lang="en"><body className={`${space.variable} ${mono.variable}`}><LanguageProvider>{children}</LanguageProvider></body></html>;
}
