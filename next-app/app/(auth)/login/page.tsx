"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ToastProvider } from "@/components/ui/toast";
import { LoginForm } from "@/components/auth/login-form";
import { Bolt } from "lucide-react";

const qc = new QueryClient();

export default function LoginPage() {
  return (
    <QueryClientProvider client={qc}>
      <ToastProvider>
        <div className="anim-scale-in rounded-sheet border border-line bg-white p-7 shadow-[0_24px_70px_rgba(15,23,42,0.12)]">
          <LoginForm />
        </div>
        <p className="mt-5 flex items-center justify-center gap-2 text-[11px] font-bold text-ink-300">
          <Bolt size={13} className="text-primary-600" fill="currentColor" strokeWidth={1} />
          توان‌بان — معاونت بهره‌برداری برق منطقه‌ای سیستان و بلوچستان
        </p>
      </ToastProvider>
    </QueryClientProvider>
  );
}
