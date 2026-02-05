import type { Metadata } from "next";
import "./globals.css";
import { Inter } from "next/font/google";

const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: {
    default: "Content Drip",
    template: "%s · Content Drip",
  },
  description: "Thoughtful content delivered with a calm cadence.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={fontSans.variable}>
      <body className="antialiased font-sans">{children}</body>
    </html>
  );
}
