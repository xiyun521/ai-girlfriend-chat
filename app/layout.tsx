import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AI 恋爱陪伴 - 虚拟女友聊天",
  description: "温柔的 AI 恋爱陪伴聊天应用，提供情绪支持与日常互动",
  keywords: ["AI", "聊天", "虚拟女友", "恋爱陪伴", "情绪支持"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
