import type { Metadata, Viewport } from "next";
import { Vazirmatn } from "next/font/google";
import "./globals.css";
import { ServiceWorkerRegister } from "@/components/pwa/service-worker-register";
import { InstallPrompt } from "@/components/pwa/install-prompt";

const vazir = Vazirmatn({ subsets: ["arabic"], display: "swap", variable: "--font-vazir" });

export const metadata: Metadata = {
  title: "توان‌بان — سامانه مدیریت بهره‌برداری و پیمانکاری شبکه برق",
  description: "سامانه‌ی سازمانی مدیریت نیروی انسانی، گزارش کار، تایید کارها، فهرست آحاد بها و قراردادها",
  manifest: "/manifest.json",
  icons: { icon: "/logo.svg" },
};

export const viewport: Viewport = {
  themeColor: "#2563EB",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" dir="rtl" className={vazir.variable}>
      <body className={vazir.className}>
        {children}
        <InstallPrompt />
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
