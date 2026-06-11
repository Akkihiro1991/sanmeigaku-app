import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
  ),
  title: "算命学 命式鑑定｜生年月日で陰占・陽占を無料算出",
  description:
    "生年月日を入力するだけで算命学の命式（陰占・陽占）を無料で算出。十大主星・天中殺・大運がわかる本格鑑定ツール。",
  openGraph: {
    title: "算命学 命式鑑定｜生年月日で陰占・陽占を無料算出",
    description:
      "生年月日を入力するだけで算命学の命式（陰占・陽占）を無料で算出。十大主星・天中殺・大運がわかる本格鑑定ツール。",
    locale: "ja_JP",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "算命学 命式鑑定｜生年月日で陰占・陽占を無料算出",
    description:
      "生年月日を入力するだけで算命学の命式（陰占・陽占）を無料で算出。十大主星・天中殺・大運がわかる本格鑑定ツール。",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ja"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
