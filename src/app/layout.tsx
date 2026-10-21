import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

import { ChromeGate } from "@/components/shell/ChromeGate";
import { FloatingAssistant } from "@/components/shell/FloatingAssistant";
import { Footer } from "@/components/shell/Footer";
import { Header } from "@/components/shell/Header";
import { TopBar } from "@/components/shell/TopBar";
import { site } from "@/config/site";

import "@/styles/tokens.css";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: site.name,
    template: `%s | ${site.name}`,
  },
  description: site.description,
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f7f1e6",
};

/**
 * Khung dùng chung cho các trang của website: TopBar, Header cố định, Footer, nút nổi.
 * Riêng /admin/dashboard và /student/dashboard có khung toàn màn hình riêng nên `ChromeGate` ẩn các phần này.
 * Phần thay đổi theo từng trang nằm trong {children}. Trang cần giao diện riêng chỉ việc render nội dung khác trong <main>.
 */
export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="vi">
      <body>
        <a className="skip-link" href="#main">
          Bỏ qua điều hướng
        </a>
        <ChromeGate>
          <TopBar />
          <Header />
        </ChromeGate>
        <main id="main">{children}</main>
        <ChromeGate>
          <Footer />
          <FloatingAssistant />
        </ChromeGate>
      </body>
    </html>
  );
}
