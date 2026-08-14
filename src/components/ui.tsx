import React, { createContext, useCallback, useContext, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, CheckCircle2, Info, Inbox, Loader2, Search, X, XCircle, ChevronRight, ChevronLeft, RefreshCw } from "lucide-react";
import type { StatusMeta } from "../types";
import { faDigits } from "../lib/utils";

export function cx(...parts: (string | false | null | undefined)[]) {
  return parts.filter(Boolean).join(" ");
}

/* ------------------------------- Toast ------------------------------- */

type ToastKind = "success" | "error" | "info" | "warn";
interface ToastItem { id: number; msg: string; kind: ToastKind; }

const ToastCtx = createContext<(msg: string, kind?: ToastKind) => void>(() => {});
export const useToast = () => useContext(ToastCtx);

const toastIcon: Record<ToastKind, React.ReactNode> = {
  success: <CheckCircle2 size={19} className="text-ok-600" />,
  error: <XCircle size={19} className="text-bad-600" />,
  warn: <AlertCircle size={19} className="text-warn-600" />,
  info: <Info size={19} className="text-primary-600" />,
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const push = useCallback((msg: string, kind: ToastKind = "info") => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t.slice(-3), { id, msg, kind }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3400);
  }, []);
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="no-print fixed bottom-20 md:bottom-6 inset-x-0 z-[120] flex flex-col items-center gap-2 px-4 pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.97 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="pointer-events-auto flex items-center gap-2.5 rounded-[14px] border border-line bg-white px-4 py-3 shadow-[0_10px_30px_rgba(15,23,42,0.12)] max-w-md w-full sm:w-auto"
            >
              {toastIcon[t.kind]}
              <span className="text-[13.5px] font-semibold text-ink-800 leading-6">{t.msg}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastCtx.Provider>
  );
}

/* ------------------------------- Buttons ------------------------------- */

type BtnVariant = "primary" | "soft" | "outline" | "ghost" | "danger" | "dangerSoft" | "success" | "warnSoft" | "dark";
type BtnSize = "sm" | "md" | "lg" | "xl";

const btnVariant: Record<BtnVariant, string> = {
  primary: "bg-primary-600 text-white hover:bg-primary-700 shadow-[0_6px_16px_rgba(37,99,235,0.28)]",
  soft: "bg-primary-50 text-primary-700 hover:bg-primary-100",
  outline: "bg-white text-ink-700 border border-line hover:bg-slate-50 hover:border-slate-300",
  ghost: "text-ink-500 hover:bg-slate-200/60",
  danger: "bg-bad-600 text-white hover:bg-bad-700 shadow-[0_6px_16px_rgba(220,38,38,0.25)]",
  dangerSoft: "bg-bad-50 text-bad-700 hover:bg-red-100",
  success: "bg-ok-600 text-white hover:bg-ok-700 shadow-[0_6px_16px_rgba(22,163,74,0.25)]",
  warnSoft: "bg-amber-50 text-warn-700 hover:bg-amber-100",
  dark: "bg-ink-900 text-white hover:bg-ink-800",
};

const btnSize: Record<BtnSize, string> = {
  sm: "h-9 px-3 text-xs rounded-[10px] gap-1.5",
  md: "h-12 px-4 text-sm rounded-[14px] gap-2",
  lg: "h-[52px] px-5 text-[15px] rounded-[14px] gap-2",
  xl: "h-14 px-6 text-base rounded-[16px] gap-2.5",
};

export function Button({
  children, variant = "primary", size = "md", loading, disabled, icon, onClick, type = "button", full, className,
}: {
  children?: React.ReactNode; variant?: BtnVariant; size?: BtnSize; loading?: boolean; disabled?: boolean;
  icon?: React.ReactNode; onClick?: () => void; type?: "button" | "submit"; full?: boolean; className?: string;
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={cx(
        "press inline-flex items-center justify-center font-bold transition-colors duration-150 outline-none",
        "focus-visible:ring-4 focus-visible:ring-primary-500/20",
        "disabled:opacity-50 disabled:pointer-events-none",
        btnVariant[variant], btnSize[size], full && "w-full", className
      )}
    >
      {loading ? <Loader2 size={size === "sm" ? 15 : 19} className="animate-spin" /> : icon}
      {children}
    </button>
  );
}

export function IconBtn({ icon, label, onClick, className, badge }: { icon: React.ReactNode; label: string; onClick?: () => void; className?: string; badge?: number }) {
  return (
    <button
      aria-label={label}
      title={label}
      onClick={onClick}
      className={cx("press relative inline-flex h-10 w-10 items-center justify-center rounded-[12px] text-ink-500 transition-colors hover:bg-slate-200/70 hover:text-ink-800", className)}
    >
      {icon}
      {badge !== undefined && badge > 0 && (
        <span className="absolute -top-0.5 -left-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-bad-600 px-1 text-[10px] font-black text-white">
          {faDigits(badge)}
        </span>
      )}
    </button>
  );
}

/* ------------------------------- Form ------------------------------- */

export function Field({ label, error, hint, required, children }: { label?: string; error?: string; hint?: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      {label && (
        <label className="mb-1.5 block text-[13px] font-bold text-ink-700">
          {label} {required && <span className="text-bad-600">*</span>}
        </label>
      )}
      {children}
      {hint && !error && <p className="mt-1 text-xs text-ink-300">{hint}</p>}
      {error && <p className="anim-fade-in mt-1 text-xs font-semibold text-bad-600">{error}</p>}
    </div>
  );
}

const inputBase =
  "h-[52px] w-full rounded-[14px] border border-line bg-white px-4 text-[15px] text-ink-900 placeholder:text-ink-300 outline-none transition-all duration-150 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10";

export function Input({ icon, ltr, className, invalid, ...rest }: React.InputHTMLAttributes<HTMLInputElement> & { icon?: React.ReactNode; ltr?: boolean; invalid?: boolean }) {
  return (
    <div className="relative">
      {icon && <span className="pointer-events-none absolute start-3.5 top-1/2 -translate-y-1/2 text-ink-300">{icon}</span>}
      <input
        dir={ltr ? "ltr" : undefined}
        className={cx(inputBase, !!icon && "ps-11", !!ltr && "text-left font-medium tracking-wide", !!invalid && "border-bad-600/60 focus:border-bad-600 focus:ring-bad-600/10", className)}
        {...rest}
      />
    </div>
  );
}

export function Textarea({ className, invalid, ...rest }: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean }) {
  return (
    <textarea
      className={cx("w-full rounded-[14px] border border-line bg-white p-3.5 text-[14.5px] leading-7 text-ink-900 placeholder:text-ink-300 outline-none transition-all duration-150 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 min-h-[110px]", invalid && "border-bad-600/60", className)}
      {...rest}
    />
  );
}

export function Select({ value, onChange, options, placeholder, className }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[]; placeholder?: string; className?: string }) {
  return (
    <div className={cx("relative", className)}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cx(inputBase, "appearance-none pe-10 cursor-pointer", !value && "text-ink-300")}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value} className="text-ink-900">{o.label}</option>
        ))}
      </select>
      <ChevronLeft size={18} className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 rotate-90 text-ink-300" />
    </div>
  );
}

export function SearchBar({ value, onChange, placeholder = "جستجو...", className }: { value: string; onChange: (v: string) => void; placeholder?: string; className?: string }) {
  return (
    <div className={cx("relative", className)}>
      <span className="pointer-events-none absolute start-3.5 top-1/2 -translate-y-1/2 text-ink-300"><Search size={19} /></span>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={cx(inputBase, "ps-11 bg-slate-50/80 focus:bg-white")} />
      {value && (
        <button onClick={() => onChange("")} className="absolute end-3 top-1/2 -translate-y-1/2 text-ink-300 hover:text-ink-500">
          <X size={16} />
        </button>
      )}
    </div>
  );
}

export function NumberStepper({ value, onChange, min = 0, max = 100000, step = 1 }: { value: number; onChange: (v: number) => void; min?: number; max?: number; step?: number }) {
  return (
    <div className="inline-flex items-center gap-1 rounded-[14px] bg-slate-100 p-1">
      <button type="button" onClick={() => onChange(Math.min(max, value + step))} className="press flex h-10 w-10 items-center justify-center rounded-[11px] bg-white text-xl font-black text-primary-700 shadow-sm">+</button>
      <span className="tnum min-w-[56px] text-center text-base font-black text-ink-900">{faDigits(value)}</span>
      <button type="button" onClick={() => onChange(Math.max(min, value - step))} className="press flex h-10 w-10 items-center justify-center rounded-[11px] bg-white text-xl font-black text-ink-500 shadow-sm disabled:opacity-40" disabled={value <= min}>−</button>
    </div>
  );
}

/* ------------------------------- Surfaces ------------------------------- */

export function Card({ children, className, onClick, pad = true }: { children: React.ReactNode; className?: string; onClick?: () => void; pad?: boolean }) {
  return (
    <div
      onClick={onClick}
      className={cx(
        "rounded-[20px] border border-line bg-white shadow-[0_1px_3px_rgba(15,23,42,0.05)]",
        pad && "p-4 md:p-5",
        onClick && "cursor-pointer transition-all duration-200 hover:-translate-y-px hover:shadow-[0_10px_28px_rgba(15,23,42,0.09)] hover:border-slate-300",
        className
      )}
    >
      {children}
    </div>
  );
}

export function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
  return <span className={cx("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-[3px] text-[11.5px] font-bold", className)}>{children}</span>;
}

export function StatusBadge({ meta }: { meta: StatusMeta }) {
  return (
    <Badge className={meta.badge}>
      <span className={cx("h-1.5 w-1.5 rounded-full", meta.dot)} />
      {meta.label}
    </Badge>
  );
}

const avatarTones = ["bg-primary-100 text-primary-700", "bg-amber-100 text-amber-700", "bg-emerald-100 text-emerald-700", "bg-rose-100 text-rose-700", "bg-sky-100 text-sky-700", "bg-teal-100 text-teal-700"];

export function Avatar({ name, size = 40, className }: { name: string; size?: number; className?: string }) {
  const initials = name.replace(/^مهندس\s+|^استاد\s+/, "").split(" ").slice(0, 2).map((w) => w[0]).join("‌");
  const tone = avatarTones[(name.length + (name.charCodeAt(0) || 0)) % avatarTones.length];
  return (
    <span style={{ width: size, height: size, fontSize: size * 0.36 }} className={cx("inline-flex shrink-0 items-center justify-center rounded-full font-black", tone, className)}>
      {initials}
    </span>
  );
}

/* ------------------------------- Modal / Sheet ------------------------------- */

export function Modal({ open, onClose, title, children, footer, wide }: { open: boolean; onClose: () => void; title?: React.ReactNode; children: React.ReactNode; footer?: React.ReactNode; wide?: boolean }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="no-print fixed inset-0 z-[90] flex items-end justify-center md:items-center md:p-6"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}
        >
          <div className="absolute inset-0 bg-ink-900/50 backdrop-blur-[2px]" onClick={onClose} />
          <motion.div
            initial={{ y: 60, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 40, opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className={cx(
              "relative flex max-h-[88vh] w-full flex-col overflow-hidden rounded-t-[24px] bg-white shadow-2xl md:max-h-[85vh] md:rounded-[24px]",
              wide ? "md:max-w-2xl" : "md:max-w-lg"
            )}
          >
            <div className="flex items-center justify-between border-b border-line/70 px-5 py-4">
              <h3 className="text-[15.5px] font-black text-ink-900">{title}</h3>
              <IconBtn icon={<X size={19} />} label="بستن" onClick={onClose} />
            </div>
            <div className="overflow-y-auto px-5 py-4">{children}</div>
            {footer && <div className="flex gap-2.5 border-t border-line/70 bg-slate-50/60 px-5 py-3.5 pb-[max(14px,env(safe-area-inset-bottom))]">{footer}</div>}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function Confirm({ open, onClose, onConfirm, title, body, confirmLabel = "تایید", tone = "primary", loading }: { open: boolean; onClose: () => void; onConfirm: () => void; title: string; body?: React.ReactNode; confirmLabel?: string; tone?: "primary" | "danger" | "success"; loading?: boolean }) {
  return (
    <Modal open={open} onClose={onClose} title={title} footer={
      <>
        <Button full variant={tone === "danger" ? "danger" : tone === "success" ? "success" : "primary"} onClick={() => { onConfirm(); }} loading={loading}>{confirmLabel}</Button>
        <Button full variant="outline" onClick={onClose}>انصراف</Button>
      </>
    }>
      <div className="text-[14px] leading-7 text-ink-500">{body}</div>
    </Modal>
  );
}

/* ------------------------------- Nav bits ------------------------------- */

export function Tabs({ value, onChange, tabs, className }: { value: string; onChange: (k: string) => void; tabs: { key: string; label: string; count?: number }[]; className?: string }) {
  return (
    <div className={cx("no-scrollbar flex gap-1 overflow-x-auto rounded-[14px] bg-slate-200/70 p-1", className)}>
      {tabs.map((t) => (
        <button
          key={t.key}
          onClick={() => onChange(t.key)}
          className={cx(
            "press flex h-9 shrink-0 items-center gap-1.5 rounded-[11px] px-3.5 text-[12.5px] font-bold transition-all duration-150",
            value === t.key ? "bg-white text-primary-700 shadow-sm" : "text-ink-500 hover:text-ink-800"
          )}
        >
          {t.label}
          {t.count !== undefined && (
            <span className={cx("tnum rounded-full px-1.5 py-px text-[10.5px] font-black", value === t.key ? "bg-primary-50 text-primary-700" : "bg-slate-300/70 text-ink-500")}>
              {faDigits(t.count)}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

/* ------------------------------- States ------------------------------- */

export function EmptyState({ icon, title, body, action, className }: { icon?: React.ReactNode; title: string; body?: string; action?: React.ReactNode; className?: string }) {
  return (
    <div className={cx("anim-fade-in flex flex-col items-center justify-center px-6 py-14 text-center", className)}>
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-[20px] bg-slate-100 text-ink-300">
        {icon || <Inbox size={30} />}
      </div>
      <h4 className="text-[15px] font-black text-ink-800">{title}</h4>
      {body && <p className="mt-1.5 max-w-sm text-[13px] leading-6 text-ink-400">{body}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function ErrorState({ body, onRetry }: { body?: string; onRetry?: () => void }) {
  return (
    <div className="anim-fade-in flex flex-col items-center justify-center px-6 py-14 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-[20px] bg-bad-50 text-bad-600"><AlertCircle size={30} /></div>
      <h4 className="text-[15px] font-black text-ink-800">خطا در دریافت اطلاعات</h4>
      <p className="mt-1.5 max-w-sm text-[13px] leading-6 text-ink-400">{body || "اتصال خود را بررسی کنید و دوباره تلاش کنید."}</p>
      {onRetry && <div className="mt-5"><Button variant="soft" icon={<RefreshCw size={17} />} onClick={onRetry}>تلاش مجدد</Button></div>}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cx("skeleton", className)} />;
}

export function ListSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="rounded-[20px] border border-line bg-white p-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3.5 w-1/3" />
              <Skeleton className="h-3 w-2/3" />
            </div>
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------- Data display ------------------------------- */

const toneBg: Record<string, string> = {
  primary: "bg-primary-50 text-primary-600",
  ok: "bg-ok-50 text-ok-600",
  warn: "bg-amber-50 text-warn-600",
  bad: "bg-bad-50 text-bad-600",
  ink: "bg-slate-100 text-ink-500",
  teal: "bg-teal-50 text-teal-600",
  cyan: "bg-cyan-50 text-cyan-600",
  orange: "bg-orange-50 text-orange-600",
  sky: "bg-sky-50 text-sky-600",
  dark: "bg-ink-900 text-white",
};

export function KpiCard({ label, value, sub, icon, tone = "primary", onClick, delay = 0 }: { label: string; value: React.ReactNode; sub?: React.ReactNode; icon?: React.ReactNode; tone?: string; onClick?: () => void; delay?: number }) {
  return (
    <div style={{ animationDelay: `${delay}ms` }} className={cx("anim-fade-up", onClick && "cursor-pointer")} onClick={onClick}>
      <Card className={cx("h-full", onClick && "transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(15,23,42,0.1)] hover:border-primary-200")}>
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[12px] font-bold text-ink-400">{label}</p>
            <p className="tnum mt-1.5 text-[21px] font-black leading-7 text-ink-900">{value}</p>
            {sub && <p className="mt-1 text-[11.5px] font-semibold text-ink-300">{sub}</p>}
          </div>
          {icon && <span className={cx("flex h-10 w-10 shrink-0 items-center justify-center rounded-[13px]", toneBg[tone] || toneBg.primary)}>{icon}</span>}
        </div>
      </Card>
    </div>
  );
}

export function PageHeader({ title, subtitle, onBack, actions, className }: { title: React.ReactNode; subtitle?: React.ReactNode; onBack?: () => void; actions?: React.ReactNode; className?: string }) {
  return (
    <div className={cx("mb-5 flex items-center justify-between gap-3", className)}>
      <div className="flex min-w-0 items-center gap-2.5">
        {onBack && (
          <button onClick={onBack} aria-label="بازگشت" className="press flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] text-ink-500 transition-colors hover:bg-slate-200/70">
            <ChevronRight size={22} />
          </button>
        )}
        <div className="min-w-0">
          <h1 className="truncate text-lg font-black text-ink-900 md:text-[21px]">{title}</h1>
          {subtitle && <p className="mt-0.5 truncate text-[12.5px] font-semibold text-ink-400">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Pagination({ page, pages, onPage }: { page: number; pages: number; onPage: (p: number) => void }) {
  if (pages <= 1) return null;
  return (
    <div className="mt-4 flex items-center justify-center gap-3">
      <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => onPage(page - 1)} icon={<ChevronRight size={15} />}>قبلی</Button>
      <span className="text-[12.5px] font-bold text-ink-400">صفحه {faDigits(page)} از {faDigits(pages)}</span>
      <Button size="sm" variant="outline" disabled={page >= pages} onClick={() => onPage(page + 1)} icon={<ChevronLeft size={15} />}>بعدی</Button>
    </div>
  );
}

export function Divider({ className }: { className?: string }) {
  return <div className={cx("h-px w-full bg-line", className)} />;
}

export function KeyValue({ k, v, ltr }: { k: string; v: React.ReactNode; ltr?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-line/60 py-2.5 text-[13px] last:border-0">
      <span className="font-bold text-ink-400">{k}</span>
      <span dir={ltr ? "ltr" : undefined} className="tnum font-bold text-ink-800">{v}</span>
    </div>
  );
}
