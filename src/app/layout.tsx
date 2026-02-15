import type { Metadata } from "next";
import "./globals.css";
import { DM_Sans, Fraunces, JetBrains_Mono } from "next/font/google";

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
  metadataBase: new URL("https://contentdrip.dev"),
  title: {
    default: "ContentDrip",
    template: "%s — ContentDrip",
  },
  description: "Thoughtful content, delivered at your pace.",
  openGraph: {
    siteName: "ContentDrip",
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
    <html lang="en" className={`${fontSans.variable} ${fontSerif.variable} ${fontMono.variable}`}>
      <body className="antialiased font-sans">{children}</body>
    </html>
  );
}
