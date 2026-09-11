import type { Metadata } from "next";
import { Noto_Sans_Bengali, Source_Serif_4 } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const notoSansBengali = Noto_Sans_Bengali({
  subsets: ["bengali"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-noto-sans-bengali",
});

const sourceSerif4 = Source_Serif_4({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-source-serif-4",
});

export const metadata: Metadata = {
  title: "Odhikar (অধিকার) - AI Legal Aid Platform",
  description: "Bangla-first legal aid, crime reporting and knowledge platform for Bangladesh.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bn" className={`${notoSansBengali.variable} ${sourceSerif4.variable}`}>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}