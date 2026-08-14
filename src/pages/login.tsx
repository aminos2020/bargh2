import React, { useEffect, useRef, useState } from "react";
import { ArrowLeft, KeyRound, RotateCcw, ShieldCheck, Smartphone, Terminal, UserRound } from "lucide-react";
import { useStore } from "../store";
import { ROLE_LABEL, ROLE_PANEL } from "../types";
import { enDigits, faDigits, maskMobile, nav } from "../lib/utils";
import { Button, Field, Input, cx } from "../components/ui";
import { Logo } from "../components/shell";

const DEMO_ACCOUNTS: { mobile: string; role: keyof typeof ROLE_LABEL; label: string }[] = [
  { mobile: "09120000001", role: "DEPUTY", label: "معاونت" },
  { mobile: "09120000002", role: "EMPLOYER_CEO", label: "رییس کارفرما" },
  { mobile: "09120000003", role: "EMPLOYER_EXPERT", label: "کارشناس کارفرما" },
  { mobile: "09120000004", role: "CONTRACTOR_CEO", label: "رییس پیمانکار" },
  { mobile: "09120000005", role: "RESIDENT_REP", label: "نماینده مقیم" },
  { mobile: "09120000006", role: "GROUP_SUPERVISOR", label: "سرپرست گروه" },
  { mobile: "09120000007", role: "TECHNICIAN", label: "کارشناس شرکت" },
];

function OtpBoxes({ value, onChange, disabled }: { value: string; onChange: (v: string) => void; disabled?: boolean }) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const chars = Array.from({ length: 5 }, (_, i) => value[i] || "");
  const setAt = (i: number, ch: string) => {
    const next = chars.slice();
    next[i] = ch;
    onChange(next.join(""));
  };
  return (
    <div dir="ltr" className="flex justify-center gap-2.5">
      {chars.map((c, i) => (
        <input
          key={i}
          ref={(el) => { refs.current[i] = el; }}
          value={c}
          disabled={disabled}
          inputMode="numeric"
          autoFocus={i === 0}
          onChange={(e) => {
            const raw = enDigits(e.target.value).replace(/\D/g, "");
            if (!raw) { setAt(i, ""); return; }
            setAt(i, raw[raw.length - 1]);
            if (i < 4) refs.current[i + 1]?.focus();
          }}
          onKeyDown={(e) => {
            if (e.key === "Backspace" && !chars[i] && i > 0) refs.current[i - 1]?.focus();
          }}
          onPaste={(e) => {
            e.preventDefault();
            const text = enDigits(e.clipboardData.getData("text")).replace(/\D/g, "").slice(0, 5);
            onChange(text);
            refs.current[Math.min(text.length, 4)]?.focus();
          }}
          className={cx(
            "h-14 w-12 rounded-[14px] border-2 border-line bg-white text-center text-xl font-black text-ink-900 outline-none transition-all",
            "focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10",
            c && "border-primary-400 bg-primary-50/60",
            disabled && "opacity-50"
          )}
        />
      ))}
    </div>
  );
}

function BrandPanel() {
  return (
    <div className="relative hidden overflow-hidden bg-ink-900 lg:flex lg:flex-col lg:justify-between lg:p-12">
      <div className="pointer-events-none absolute inset-0 opacity-[0.16]"
        style={{ backgroundImage: "linear-gradient(rgba(148,163,184,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,.5) 1px, transparent 1px)", backgroundSize: "42px 42px" }} />
      <div className="pointer-events-none absolute -top-32 -start-32 h-96 w-96 rounded-full bg-primary-600/25 blur-[110px]" />
      <div className="pointer-events-none absolute bottom-0 end-0 h-80 w-80 rounded-full bg-primary-500/15 blur-[100px]" />

      <div className="relative"><Logo dark /></div>

      <div className="relative">
        <svg viewBox="0 0 420 120" className="mb-8 w-full max-w-md text-primary-400">
          <path d="M0 90 H90 L110 55 H200 L220 90 H420" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="400" style={{ animation: "drawLine 2.6s ease-out infinite alternate" }} />
          <circle cx="110" cy="55" r="5" fill="currentColor" className="pulse-dot" />
          <circle cx="220" cy="90" r="5" fill="currentColor" className="pulse-dot" style={{ animationDelay: "0.6s" }} />
          <rect x="86" y="86" width="48" height="24" rx="6" fill="none" stroke="currentColor" strokeWidth="2" />
        </svg>
        <h2 className="text-[34px] font-black leading-[1.5] text-white">
          سامانه یکپارچه مدیریت
          <span className="text-primary-400"> گزارش کار و قراردادها</span>
        </h2>
        <p className="mt-4 max-w-md text-[15px] leading-8 text-slate-400">
          گردش کامل گزارش از تکنسین میدانی تا تایید نهایی معاونت؛ با فهرست آحاد بها، صورت‌وضعیت، کارهای محوله و ثبت آفلاین در شرایط میدانی.
        </p>
        <div className="mt-8 flex flex-wrap gap-2.5">
          {["گردش تایید سه‌مرحله‌ای", "فهرست آحاد بها", "ثبت آفلاین و همگام‌سازی", "صورت‌وضعیت و Audit Log"].map((t) => (
            <span key={t} className="rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-[12px] font-bold text-slate-300">{t}</span>
          ))}
        </div>
      </div>

      <p className="relative text-[12px] font-semibold text-slate-500">معاونت بهره‌برداری برق منطقه‌ای سیستان و بلوچستان — ۱۴۰۴</p>
    </div>
  );
}

export default function LoginPage() {
  const { checkPhone, sendOtp, verifyOtp, session } = useStore();
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [mobile, setMobile] = useState("");
  const [masked, setMasked] = useState("");
  const [userName, setUserName] = useState("");
  const [realMobile, setRealMobile] = useState("");
  const [error, setError] = useState("");
  const [shakeKey, setShakeKey] = useState(0);
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [devCode, setDevCode] = useState("");
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    if (session) nav(`/${ROLE_PANEL[session.role]}/home`);
  }, [session]);

  useEffect(() => {
    if (timer <= 0) return;
    const t = setTimeout(() => setTimer((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [timer]);

  const fail = (msg: string) => { setError(msg); setShakeKey((k) => k + 1); };

  const submitPhone = () => {
    setError("");
    setLoading(true);
    setTimeout(() => {
      const res = checkPhone(mobile);
      setLoading(false);
      if (!res.ok) { fail(res.message || "خطا"); return; }
      setMasked(res.masked || "");
      setUserName(res.name || "");
      setRealMobile(res.mobile || "");
      setOtp(""); setOtpSent(false); setDevCode("");
      setStep("otp");
    }, 550);
  };

  const doSendOtp = () => {
    const res = sendOtp(realMobile);
    if (!res.ok) { fail(res.message || "خطا در ارسال کد"); return; }
    setOtpSent(true);
    setDevCode(res.devCode || "");
    setTimer(120);
    setError("");
  };

  const submitOtp = () => {
    if (otp.length !== 5) { fail("کد ۵ رقمی را کامل وارد کنید."); return; }
    setLoading(true);
    setTimeout(() => {
      const res = verifyOtp(otp);
      setLoading(false);
      if (!res.ok) { fail(res.message || "خطا"); return; }
    }, 500);
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-[1fr_1.1fr]">
      <BrandPanel />
      <div className="flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-[430px]">
          <div className="mb-6 lg:hidden"><Logo /></div>

          <div key={shakeKey} className={cx("anim-scale-in rounded-[24px] border border-line bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)] md:p-8", error && "anim-shake")}>
            <div className="mb-5 flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-[15px] bg-primary-50 text-primary-600">
                <ShieldCheck size={25} />
              </span>
              <div>
                <h1 className="text-[19px] font-black text-ink-900">ورود به سامانه</h1>
                <p className="mt-0.5 text-[12.5px] font-semibold text-ink-400">
                  {step === "phone" ? "شماره موبایل ثبت‌شده توسط مدیر سامانه را وارد کنید." : `کد ارسال‌شده به ${masked} را وارد کنید.`}
                </p>
              </div>
            </div>

            {step === "phone" ? (
              <div className="anim-fade-up">
                <Field label="شماره موبایل" required>
                  <Input
                    ltr
                    inputMode="numeric"
                    placeholder="09xxxxxxxxx"
                    icon={<Smartphone size={19} />}
                    value={mobile}
                    onChange={(e) => setMobile(enDigits(e.target.value))}
                    onKeyDown={(e) => e.key === "Enter" && submitPhone()}
                    maxLength={14}
                    invalid={!!error}
                  />
                </Field>
                <Button full size="xl" loading={loading} onClick={submitPhone} icon={<ArrowLeft size={19} />}>
                  ادامه
                </Button>
                <p className="mt-4 text-center text-[11.5px] font-semibold leading-6 text-ink-300">
                  فقط کاربران ثبت‌شده می‌توانند وارد شوند؛ ثبت‌نام در سامانه وجود ندارد.
                </p>

                <div className="mt-6 rounded-[16px] border border-dashed border-slate-300 bg-slate-50/70 p-3.5">
                  <p className="mb-2.5 flex items-center gap-1.5 text-[11px] font-black text-ink-400">
                    <Terminal size={13} /> ورود آزمایشی (حالت توسعه)
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {DEMO_ACCOUNTS.map((a) => (
                      <button key={a.mobile} onClick={() => { setMobile(a.mobile); setError(""); }}
                        className={cx("press rounded-full border px-2.5 py-1 text-[10.5px] font-bold transition-colors", mobile === a.mobile ? "border-primary-500 bg-primary-50 text-primary-700" : "border-line bg-white text-ink-500 hover:border-primary-300")}>
                        {a.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="anim-fade-up">
                <div className="mb-4 flex items-center justify-between rounded-[14px] bg-primary-50/70 px-3.5 py-2.5">
                  <span className="flex items-center gap-2 text-[12.5px] font-bold text-primary-700">
                    <UserRound size={16} /> {userName}
                  </span>
                  <span dir="ltr" className="tnum text-[12.5px] font-black text-ink-500">{masked}</span>
                </div>

                {!otpSent ? (
                  <div className="py-2 text-center">
                    <p className="mb-4 text-[13px] leading-7 text-ink-500">
                      برای دریافت کد تایید ۵ رقمی، دکمه زیر را بزنید. کد تا ۲ دقیقه اعتبار دارد.
                    </p>
                    <Button full size="xl" icon={<KeyRound size={19} />} onClick={doSendOtp}>ارسال کد تایید</Button>
                  </div>
                ) : (
                  <>
                    <OtpBoxes value={otp} onChange={setOtp} disabled={loading} />
                    {devCode && (
                      <p className="anim-fade-in mt-3 rounded-[12px] bg-amber-50 px-3 py-2 text-center text-[12px] font-black text-warn-700">
                        حالت توسعه — کد تایید: <span dir="ltr" className="tnum">{faDigits(devCode)}</span>
                      </p>
                    )}
                    <Button full size="xl" className="mt-4" loading={loading} onClick={submitOtp} disabled={otp.length !== 5}>
                      تایید کد
                    </Button>
                    <div className="mt-3 flex items-center justify-between">
                      <button onClick={() => timer === 0 && doSendOtp()} disabled={timer > 0}
                        className={cx("flex items-center gap-1 text-[12px] font-bold", timer > 0 ? "cursor-default text-ink-300" : "text-primary-600 hover:text-primary-700")}>
                        <RotateCcw size={13} />
                        {timer > 0 ? `ارسال مجدد تا ${faDigits(timer)} ثانیه دیگر` : "ارسال مجدد کد"}
                      </button>
                      <button onClick={() => { setStep("phone"); setError(""); }} className="text-[12px] font-bold text-ink-400 hover:text-ink-700">
                        تغییر شماره موبایل
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            {error && (
              <p className="anim-fade-in mt-4 rounded-[12px] bg-bad-50 px-3.5 py-2.5 text-[12.5px] font-bold leading-6 text-bad-700">{error}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export { maskMobile };
