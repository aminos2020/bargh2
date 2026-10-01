import Link from "next/link";
import { ShieldOff } from "lucide-react";

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="anim-scale-in w-full max-w-md rounded-sheet border border-line bg-white p-8 text-center shadow-sm">
        <span className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-[20px] bg-bad-50 text-bad-600">
          <ShieldOff size={30} />
        </span>
        <h1 className="text-lg font-black text-ink-900">دسترسی مجاز نیست</h1>
        <p className="mt-2 text-[13px] font-bold leading-7 text-ink-400">
          نقش شما اجازه‌ی مشاهده‌ی این بخش را ندارد. اگر فکر می‌کنید اشتباهی رخ داده، با مدیر سامانه تماس بگیرید.
        </p>
        <Link href="/login" className="press mt-5 inline-flex h-[52px] items-center justify-center rounded-input bg-primary-600 px-6 text-[14px] font-bold text-white hover:bg-primary-700">
          بازگشت به صفحه ورود
        </Link>
      </div>
    </div>
  );
}
