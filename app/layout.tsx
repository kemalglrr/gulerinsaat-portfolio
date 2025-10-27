import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Güler Yapı Proje | Profesyonel Taşeronluk Hizmetleri",
  description: "Güler Yapı Proje, yılların deneyimi ile inşaat sektöründe taşeronluk hizmeti vermektedir. Kaliteli işçilik ve zamanında teslimat.",
  keywords: "güler yapı proje, taşeronluk, inşaat, proje, kaliteli işçilik",
  openGraph: {
    title: "Güler Yapı Proje | Profesyonel Taşeronluk Hizmetleri",
    description: "Güler Yapı Proje, yılların deneyimi ile inşaat sektöründe taşeronluk hizmeti vermektedir.",
    url: "https://gulerinsaat.org",
    siteName: "Güler Yapı Proje",
    locale: "tr_TR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className="scroll-smooth">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
