import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "توان‌بان — سامانه مدیریت بهره‌برداری شبکه برق",
    short_name: "توان‌بان",
    description: "سامانه‌ی سازمانی گزارش کار، تاییدها و پیمانکاری",
    start_url: "/login",
    display: "standalone",
    background_color: "#F8FAFC",
    theme_color: "#2563EB",
    dir: "rtl",
    lang: "fa",
    icons: [{ src: "/logo.svg", sizes: "any", type: "image/svg+xml", purpose: "any" }],
  };
}
