import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "フィッシュタイム - 海鮮・寿司ナビ",
  description: "全国の寿司・和食・海鮮レストランを地図で見つけるアプリ。",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "フィッシュタイム",
  },
  icons: { apple: "/fishtime-icon-192.png" },
  openGraph: {
    title: "フィッシュタイム🐟 - 海鮮・寿司ナビ",
    description: "全国の寿司・和食・海鮮レストランを地図で見つけるアプリ。",
    url: "https://fishtime.vercel.app",
    siteName: "フィッシュタイム",
    images: [{ url: "https://fishtime.vercel.app/icon-512.png", width: 512, height: 512 }],
    locale: "ja_JP",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "フィッシュタイム🐟 - 海鮮・寿司ナビ",
    description: "全国の寿司・和食・海鮮レストランを地図で見つけるアプリ。",
    images: ["https://fishtime.vercel.app/icon-512.png"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="フィッシュタイム" />
        <link rel="icon" href="/fishtime-icon-192.png" type="image/png" />
        <link rel="apple-touch-icon" href="/fishtime-icon-192.png" />
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-0822883607725147" crossOrigin="anonymous"></script>
      </head>
      <body>{children}</body>
    </html>
  );
}
