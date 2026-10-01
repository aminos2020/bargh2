export const APP_NAME = "توان‌بان";
export const APP_SUBTITLE = "سامانه‌ی مدیریت بهره‌برداری و پیمانکاری شبکه برق";
export const DB_SEED_VERSION = 3;

export const REPORT_FLOW: Record<string, string> = {
  draft: "پیش‌نویس",
  submitted: "ارسال‌شده",
  supervisor_review: "در انتظار سرپرست",
  expert_review: "در انتظار کارشناس کارفرما",
  employer_ceo_review: "در انتظار تایید نهایی",
  approved: "تایید نهایی",
  rejected: "رد شده",
  redo_requested: "انجام مجدد",
  disputed: "اختلاف",
  settled: "تسویه‌شده",
};

export const SCORE_PER_APPROVED_REPORT = 10;
