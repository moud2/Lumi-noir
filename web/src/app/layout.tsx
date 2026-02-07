import "./globals.css";
import Header from "@/components/Header";
import { LanguageProvider } from "@/lib/i18n";
import { IBM_Plex_Sans_Arabic, Space_Grotesk, Sora } from "next/font/google";

const bodyFont = Sora({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const displayFont = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const arabicFont = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-arabic",
  display: "swap",
});

export const metadata = {
  title: "Lumi Noir",
  description: "Online Abaya Shop",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body
        className={`${bodyFont.variable} ${displayFont.variable} ${arabicFont.variable} text-[var(--text)]`}
      >
        <LanguageProvider>
          <Header />
          <main className="mx-auto max-w-5xl p-4 pb-12">{children}</main>
        </LanguageProvider>
      </body>
    </html>
  );
}
