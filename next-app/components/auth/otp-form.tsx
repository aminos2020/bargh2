"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiPost } from "@/lib/api-fetch";
import { faDigits } from "@/lib/amount";
import { useToast } from "@/components/ui/toast";
import type { Role } from "@/types";

const ROLE_HOME: Record<Role, string> = {
  DEPUTY: "/deputy", EMPLOYER_CEO: "/employer-ceo", EMPLOYER_EXPERT: "/employer-expert",
  CONTRACTOR_CEO: "/contractor-ceo", RESIDENT_REP: "/resident", GROUP_SUPERVISOR: "/supervisor", TECHNICIAN: "/technician",
};

export function OtpForm({ mobile, maskedMobile, fullName, onBack }: { mobile: string; maskedMobile: string; fullName: string; onBack: () => void }) {
  const router = useRouter();
  const toast = useToast();
  const [digits, setDigits] = useState<string[]>(["", "", "", "", ""]);
  const [timer, setTimer] = useState(120);
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [devCode, setDevCode] = useState<string | null>(null);
  const [shake, setShake] = useState(0);
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  const requestOtp = async () => {
    setSending(true);
    setError(null);
    try {
      const res = await apiPost<{ devCode?: string }>("/api/v1/auth/send-otp", { mobile });
      if (res.devCode) setDevCode(res.devCode);
      setTimer(120);
      toast("کد ۵ رقمی ارسال شد.", "success");
      setTimeout(() => refs.current[0]?.focus(), 100);
    } catch (e) {
      setError(e instanceof Error ? e.message : "ارسال کد ناموفق بود.");
    } finally {
      setSending(false);
    }
  };

  useEffect(() => { void requestOtp(); /* اولین بار خودکار */ // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (timer <= 0) return;
    const t = setInterval(() => setTimer((v) => v - 1), 1000);
    return () => clearInterval(t);
  }, [timer > 0]);

  const setAt = (i: number, raw: string) => {
    const v = raw.replace(/\D/g, "").slice(-1);
    setDigits((d) => {
      const next = [...d];
      next[i] = v;
      return next;
    });
    if (v && i < 4) refs.current[i + 1]?.focus();
  };

  const verify = async (code?: string) => {
    const final = code || digits.join("");
    if (final.length !== 5) { setError("کد ۵ رقمی را کامل وارد کنید."); setShake((s) => s + 1); return; }
    setVerifying(true);
    setError(null);
    try {
      const res = await apiPost<{ role: Role }>("/api/v1/auth/verify-otp", { mobile, code: final });
      toast("ورود موفق — خوش آمدید.", "success");
      router.push(ROLE_HOME[res.role]);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "ورود ناموفق بود.");
      setShake((s) => s + 1);
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div key={shake} className={shake ? "anim-shake" : undefined}>
      <div className="mb-5 text-center">
        <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-[16px] bg-primary-50 text-primary-600"><KeyRound size={22} /></span>
        <p className="text-[14px] font-black text-ink-900">{fullName}</p>
        <p dir="ltr" className="tnum mt-0.5 text-[12.5px] font-bold text-ink-400">{maskedMobile}</p>
      </div>

      <div dir="ltr" className="flex justify-center gap-2.5">
        {digits.map((d, i) => (
          <input
            key={i}
            ref={(el) => { refs.current[i] = el; }}
            value={d}
            inputMode="numeric"
            maxLength={2}
            onChange={(e) => setAt(i, e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Backspace" && !digits[i] && i > 0) refs.current[i - 1]?.focus();
              if (e.key === "Enter") void verify();
            }}
            className="tnum h-14 w-12 rounded-input border border-line bg-white text-center text-[20px] font-black text-ink-900 outline-none transition-all focus:border-primary-500 focus:ring-4 focus:ring-primary-500/15"
          />
        ))}
      </div>

      {devCode && (
        <div className="anim-fade-in mt-4 rounded-input border border-dashed border-primary-300 bg-primary-50/60 px-4 py-2.5 text-center">
          <p className="text-[11px] font-bold text-primary-700">حالت توسعه — کد ارسال‌نشده:</p>
          <p dir="ltr" className="tnum mt-1 text-[22px] font-black tracking-[0.4em] text-primary-700">{devCode}</p>
          <p className="mt-1 text-[10px] font-bold text-primary-600/70">در production این بخش حذف و کد فقط پیامک می‌شود.</p>
        </div>
      )}

      {error && <p className="anim-fade-in mt-3 text-center text-[12.5px] font-bold text-bad-600">{error}</p>}

      <Button full size="lg" className="mt-5" loading={verifying} onClick={() => void verify()}>تایید کد</Button>

      <div className="mt-4 flex items-center justify-between">
        <button onClick={onBack} className="text-[12px] font-black text-ink-400 transition-colors hover:text-primary-600">تغییر شماره موبایل</button>
        <button
          onClick={requestOtp}
          disabled={timer > 0 || sending}
          className="flex items-center gap-1.5 text-[12px] font-black text-primary-600 transition-colors disabled:text-ink-300"
        >
          <RotateCcw size={13} />
          {timer > 0 ? `ارسال مجدد کد (${faDigits(timer)})` : "ارسال مجدد کد"}
        </button>
      </div>
    </div>
  );
}
