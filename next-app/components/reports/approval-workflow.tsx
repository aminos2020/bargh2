"use client";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, RotateCcw, ShieldAlert, XCircle, History } from "lucide-react";
import { apiPost } from "@/lib/api-fetch";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Textarea } from "@/components/ui/textarea";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { useMobile } from "@/hooks/use-mobile";
import { useAuthStore } from "@/stores/auth-store";
import type { ApprovalEvent, WorkReport } from "@/types";
import { REPORT_STATUS_LABEL } from "@/types";
import { relativeTimeFa } from "@/lib/date-client";
import { cn } from "@/lib/cn";

const ACTION_FA: Record<string, string> = {
  submit: "ارسال گزارش", resubmit: "ارسال مجدد", approve: "تایید", reject: "رد", redo: "درخواست انجام مجدد", dispute: "ثبت اختلاف",
};

interface Props {
  report: WorkReport;
  events: ApprovalEvent[];
}

/** اکشن‌های تایید/رد/مجدد/اختلاف + تایم‌لاین گردش کار */
export function ApprovalWorkflow({ report, events }: Props) {
  const me = useAuthStore((s) => s.me);
  const toast = useToast();
  const qc = useQueryClient();
  const mobile = useMobile();
  const [reasonFor, setReasonFor] = useState<null | "reject" | "redo" | "dispute">(null);
  const [reason, setReason] = useState("");
  const [confirmApprove, setConfirmApprove] = useState(false);
  const [acting, setActing] = useState(false);

  const canAct =
    !!me && me._id !== report.userId &&
    ((me.role === "GROUP_SUPERVISOR" && report.status === "supervisor_review") ||
      (me.role === "EMPLOYER_EXPERT" && report.status === "expert_review") ||
      (me.role === "EMPLOYER_CEO" && report.status === "employer_ceo_review"));

  const isOwner = me?._id === report.userId;
  const canResubmit = isOwner && report.status === "redo_requested";

  const act = async (action: "approve" | "reject" | "redo" | "dispute", reasonText?: string) => {
    setActing(true);
    try {
      await apiPost(`/api/v1/reports/${report._id}/approval`, { action, reason: reasonText });
      toast(action === "approve" ? "گزارش تایید و به مرحله بعد ارسال شد." : "عملیات با موفقیت ثبت شد.", "success");
      qc.invalidateQueries({ queryKey: ["report", report._id] });
      qc.invalidateQueries({ queryKey: ["reports"] });
    } catch (e) {
      toast(e instanceof Error ? e.message : "عملیات ناموفق بود.", "error");
    } finally {
      setActing(false);
      setReasonFor(null);
      setReason("");
    }
  };

  const approveLabel = me?.role === "EMPLOYER_CEO" ? "تایید نهایی" : "تایید";

  const actionBar = canAct ? (
    <div className={cn("z-30 flex gap-2.5 border-t border-line bg-white/95 p-3.5 backdrop-blur", mobile ? "fixed inset-x-0 bottom-16" : "sticky top-16 mt-4 rounded-card border shadow-sm")}>
      <Button variant="success" size="lg" className="flex-1" loading={acting} onClick={() => setConfirmApprove(true)} icon={<CheckCircle2 size={19} />}>{approveLabel}</Button>
      {me?.role === "EMPLOYER_CEO" ? (
        <>
          <Button variant="dangerSoft" size="lg" icon={<XCircle size={18} />} onClick={() => setReasonFor("reject")}>رد نهایی</Button>
          <Button variant="outline" size="lg" className="text-rose-600" icon={<ShieldAlert size={18} />} onClick={() => setReasonFor("dispute")}>اختلاف</Button>
        </>
      ) : (
        <>
          <Button variant="warnSoft" size="lg" icon={<RotateCcw size={18} />} onClick={() => setReasonFor("redo")}>انجام مجدد</Button>
          <Button variant="dangerSoft" size="lg" icon={<XCircle size={18} />} onClick={() => setReasonFor("reject")}>رد</Button>
        </>
      )}
    </div>
  ) : canResubmit ? (
    <div className={cn("z-30 border-t border-line bg-white/95 p-3.5 backdrop-blur", mobile ? "fixed inset-x-0 bottom-16" : "sticky top-16 mt-4 rounded-card border shadow-sm")}>
      <Button full variant="primary" size="lg" loading={acting} onClick={() => void resubmit()} icon={<RotateCcw size={18} />}>
        اصلاح و ارسال مجدد
      </Button>
    </div>
  ) : null;

  const resubmit = async () => {
    setActing(true);
    try {
      await apiPost(`/api/v1/reports/${report._id}/resubmit`, {});
      toast("گزارش مجددا برای بررسی ارسال شد.", "success");
      qc.invalidateQueries({ queryKey: ["report", report._id] });
    } catch (e) {
      toast(e instanceof Error ? e.message : "ناموفق بود.", "error");
    } finally {
      setActing(false);
    }
  };

  const ReasonModal = mobile ? BottomSheet : Modal;

  return (
    <>
      {actionBar}

      {/* تایم‌لاین */}
      <div className="mt-5 rounded-card border border-line bg-white p-4">
        <p className="mb-4 flex items-center gap-2 text-[13px] font-black text-ink-700"><History size={15} className="text-ink-300" /> تاریخچه گردش کار</p>
        <div className="space-y-0">
          {events.map((e, i) => (
            <div key={e._id} className="relative flex gap-3 pb-5 last:pb-0">
              {i < events.length - 1 && <span className="absolute start-[13px] top-7 h-[calc(100%-24px)] w-px bg-line" />}
              <span className={cn(
                "z-10 mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-white text-white shadow-sm",
                e.action === "approve" ? "bg-ok-600" : e.action === "reject" || e.action === "dispute" ? "bg-bad-600" : e.action === "redo" ? "bg-warn-600" : "bg-primary-600"
              )}>
                {e.action === "approve" ? <CheckCircle2 size={13} /> : e.action === "reject" || e.action === "dispute" ? <XCircle size={13} /> : e.action === "redo" ? <RotateCcw size={13} /> : <History size={13} />}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[12.5px] font-black text-ink-800">
                  {ACTION_FA[e.action]} — {REPORT_STATUS_LABEL[e.toStatus as keyof typeof REPORT_STATUS_LABEL]}
                </p>
                <p className="mt-0.5 text-[11.5px] font-bold text-ink-400">{e.actorName} ({ROLE_FA(e.actorRole)}) — {relativeTimeFa(e.createdAt)}</p>
                {e.reason && <p className="mt-1 rounded-[10px] bg-slate-50 px-3 py-2 text-[11.5px] font-bold leading-6 text-ink-500">دلیل: {e.reason}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>

      <ConfirmationDialog
        open={confirmApprove}
        onClose={() => setConfirmApprove(false)}
        onConfirm={() => void act("approve")}
        title={me?.role === "EMPLOYER_CEO" ? "تایید نهایی گزارش" : "تایید گزارش"}
        body={me?.role === "EMPLOYER_CEO" ? "با تایید نهایی، گزارش برای معاونت قابل مشاهده شده و امتیاز آن برای نیرو ثبت می‌شود." : "گزارش به مرحله بعدی گردش تایید ارسال می‌شود."}
        confirmLabel={approveLabel}
        variant="success"
      />

      <ReasonModal open={!!reasonFor} onClose={() => { setReasonFor(null); setReason(""); }}
        title={reasonFor === "reject" ? "دلیل رد گزارش" : reasonFor === "redo" ? "دلیل درخواست انجام مجدد" : "شرح اختلاف"}>
        <Textarea placeholder="دلیل را بنویسید (الزامی)..." value={reason} onChange={(e) => setReason(e.target.value)} />
        <div className="mt-4 flex gap-2.5">
          <Button full variant={reasonFor === "reject" ? "danger" : reasonFor === "dispute" ? "outline" : "warnSoft"}
            loading={acting}
            disabled={!reason.trim()}
            onClick={() => reasonFor && void act(reasonFor, reason)}>
            ثبت
          </Button>
          <Button full variant="ghost" onClick={() => { setReasonFor(null); setReason(""); }}>انصراف</Button>
        </div>
      </ReasonModal>
    </>
  );
}

function ROLE_FA(role: string): string {
  const map: Record<string, string> = {
    DEPUTY: "معاونت", EMPLOYER_CEO: "رییس کارفرما", EMPLOYER_EXPERT: "کارشناس کارفرما",
    CONTRACTOR_CEO: "رییس شرکت", RESIDENT_REP: "نماینده مقیم", GROUP_SUPERVISOR: "سرپرست گروه", TECHNICIAN: "کارشناس شرکت",
  };
  return map[role] || role;
}
