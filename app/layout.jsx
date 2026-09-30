import { LanguageProvider } from "@/components/LanguageProvider";
import "./globals.css";

export const metadata = {
  title: "Rivertrade Swapbridge",
  description: "Crypto swap and bridge dashboard",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col"><LanguageProvider>{children}</LanguageProvider></body>
    </html>
  );
}