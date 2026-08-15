"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Smartphone, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { apiPost } from "@/lib/api-fetch";
import type { CheckPhoneResult } from "@/types";
import { OtpForm } from "./otp-form";

export function LoginForm() {
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [mobile, setMobile] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState<{ maskedMobile: string; fullName: string } | null>(null);
  const [shake, setShake] = useState(0);

  const continueToOtp = async () => {
    setError(null);
    setNotFound(false);
    setLoading(true);
    try {
      const res = await apiPost<CheckPhoneResult>("/api/v1/auth/check-phone", { mobile });
      if (res.state === "not_found") {
        setNotFound(true);
        setShake((s) => s + 1);
        return;
      }
      if (res.state === "inactive") {
        setError("دسترسی شما غیرفعال شده است. با مدیر تماس بگیرید.");
        setShake((s) => s + 1);
        return;
      }
      setInfo({ maskedMobile: res.maskedMobile, fullName: res.fullName });
      setStep("otp");
    } catch (e) {
      setError(e instanceof Error ? e.message : "خطایی رخ داده است.");
      setShake((s) => s + 1);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      key={shake}
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      className={shake ? "anim-shake" : undefined}
    >
      <div className="mb-6 text-center">
        <span className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-[22px] bg-primary-600 text-white shadow-lg shadow-primary-600/30">
          <ShieldCheck size={30} />
        </span>
        <h1 className="text-[20px] font-black text-ink-900">ورود به سامانه</h1>
        <p className="mt-1.5 text-[12.5px] font-bold leading-6 text-ink-400">شماره موبایل ثبت‌شده توسط مدیر سامانه را وارد کنید.</p>
      </div>

      <AnimatePresence mode="wait">
        {step === "phone" ? (
          <motion.div key="phone" initial={{ opacity: 0, x: -14 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 14 }} transition={{ duration: 0.2 }}>
            <Input
              ltr
              icon={<Smartphone size={19} />}
              inputMode="numeric"
              placeholder="09xxxxxxxxx"
              value={mobile}
              onChange={(e) => { setMobile(e.target.value); setError(null); setNotFound(false); }}
              onKeyDown={(e) => e.key === "Enter" && continueToOtp()}
              error={error}
            />
            {notFound && (
              <div className="anim-fade-in mt-3 rounded-input border border-amber-200 bg-warn-50 px-4 py-3 text-[12.5px] font-bold leading-6 text-warn-700">
                این شماره موبایل در سامانه ثبت نشده است. با مدیر مربوطه تماس بگیرید.
              </div>
            )}
            <Button full size="lg" className="mt-4" onClick={continueToOtp} loading={loading} disabled={!mobile.trim()}>
              {loading ? <span className="sr-only">در حال بررسی</span> : "ادامه"}
            </Button>
            <p className="mt-4 text-center text-[11.5px] font-bold text-ink-300">فقط کاربران ثبت‌شده می‌توانند وارد شوند.</p>
          </motion.div>
        ) : (
          <motion.div key="otp" initial={{ opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -14 }} transition={{ duration: 0.2 }}>
            <OtpForm
              mobile={mobile}
              maskedMobile={info?.maskedMobile || ""}
              fullName={info?.fullName || ""}
              onBack={() => { setStep("phone"); setError(null); setNotFound(false); }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
