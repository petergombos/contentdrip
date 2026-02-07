import type { Metadata } from "next";
import "./globals.css";
import { DM_Sans, Fraunces } from "next/font/google";

const fontSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

const fontSerif = Fraunces({
  subsets: ["latin"],
  variable: "--font-serif",
  axes: ["SOFT", "WONK", "opsz"],
});

export const metadata: Metadata = {
  title: {
    default: "ContentDrip",
    template: "%s — ContentDrip",
  },
  description: "Thoughtful content, delivered at your pace.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${fontSans.variable} ${fontSerif.variable}`}>
      <body className="antialiased font-sans">{children}</body>
    </html>
  );
}
