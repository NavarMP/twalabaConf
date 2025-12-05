import type { Metadata, Viewport } from "next";
import { Poppins, Anek_Malayalam, Noto_Serif_Malayalam } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import { LanguageProvider } from "@/lib/i18n/LanguageContext";
import { Analytics } from "@vercel/analytics/next";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const anekMalayalam = Anek_Malayalam({
  variable: "--font-anek-malayalam",
  subsets: ["malayalam"],
  weight: ["300", "400", "500", "600", "700"],
});

const notoSerifMalayalam = Noto_Serif_Malayalam({
  variable: "--font-noto-serif-malayalam",
  subsets: ["malayalam"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "SKSSF Twalaba Conference 2025",
  description: "SKSSF Twalaba Conference 2025 at CBMS Islamic Academy, Vilayil-Parappur, Malappuram, Kerala",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  themeColor: "#1f3661",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${poppins.variable} ${anekMalayalam.variable} ${notoSerifMalayalam.variable} antialiased`}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem={true}>
          <LanguageProvider>
            {children}
          </LanguageProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
