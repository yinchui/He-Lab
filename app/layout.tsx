import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "He Lab 试剂库",
  description: "实验室试剂登记与管理系统",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-50`}>
        <header className="bg-gradient-to-r from-blue-900 to-blue-700 text-white text-center py-5 shadow-lg">
          <h1 className="text-2xl font-black tracking-widest uppercase">⬡ He Lab</h1>
          <p className="text-blue-200 text-xs tracking-widest mt-1">Laboratory Reagent &amp; Consumables Registry</p>
        </header>
        <main className="max-w-6xl mx-auto">{children}</main>
      </body>
    </html>
  );
}
