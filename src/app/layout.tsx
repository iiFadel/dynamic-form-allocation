import type { Metadata } from "next";
import { Noto_Sans_Arabic } from "next/font/google";
import "./globals.css";

const notoArabic = Noto_Sans_Arabic({
  subsets: ["arabic"],
  variable: "--font-noto-arabic",
  display: "swap",
});

export const metadata: Metadata = {
  title: "مولد النماذج الديناميكي",
  description:
    "خدمة مبسطة لإنشاء نماذج ديناميكية عبر webhook وإرسال النتائج إلى n8n",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body className={`${notoArabic.variable} antialiased`}>{children}</body>
    </html>
  );
}
