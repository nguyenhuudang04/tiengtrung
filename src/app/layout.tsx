import type { Metadata, Viewport } from "next";
import { Inter, Noto_Sans_TC } from "next/font/google";
import "./globals.css";
import { Sidebar, MobileHeader, BottomNav } from "@/components/Navigation";
import { Toaster } from "react-hot-toast";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
});

const notoSansTC = Noto_Sans_TC({
  variable: "--font-noto-sans-tc",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "中文詞彙 - Học tiếng Trung Phồn Thể",
  description: "Ứng dụng học từ vựng tiếng Trung Phồn Thể",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1, // Prevent iOS zoom on inputs
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={`${inter.variable} ${notoSansTC.variable}`}>
      <body className="min-h-[100dvh] bg-gray-50 flex flex-col md:flex-row text-gray-900 font-sans">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0 min-h-[100dvh]">
          <MobileHeader />
          <main className="flex-1 overflow-x-hidden overflow-y-auto pb-24 md:pb-8">
            <div className="w-full max-w-6xl mx-auto px-4 md:px-8 pt-4 md:pt-8">
              {children}
            </div>
          </main>
        </div>
        <BottomNav />
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
