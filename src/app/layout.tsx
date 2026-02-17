import type { Metadata } from "next";
import "./globals.css";
import { DM_Sans, Fraunces, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";

const fontSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

const fontSerif = Fraunces({
  subsets: ["latin"],
  variable: "--font-serif",
  axes: ["SOFT", "WONK", "opsz"],
});

const fontMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
});

export const metadata: Metadata = {
  metadataBase: new URL("http://localhost:3000"),
  title: {
    default: "My Email Course",
    template: "%s — My Email Course",
  },
  description: "A free email course delivered straight to your inbox.",
  openGraph: {
    siteName: "My Email Course",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${fontSans.variable} ${fontSerif.variable} ${fontMono.variable}`}>
      <body className="antialiased font-sans">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
