import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "Qiao · 个人数字花园", description: "项目、思考与日常笔记" };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="zh-CN"><body>{children}</body></html>; }
