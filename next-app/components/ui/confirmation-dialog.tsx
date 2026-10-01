"use client";
import { Modal } from "./modal";
import { BottomSheet } from "./bottom-sheet";
import { Button } from "./button";
import { useMobile } from "@/hooks/use-mobile";

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  body?: string;
  confirmLabel?: string;
  variant?: "danger" | "primary" | "success";
}

/** در دسکتاپ Modal وسط صفحه — در موبایل Bottom Sheet */
export function ConfirmationDialog({ open, onClose, onConfirm, title, body, confirmLabel = "تایید", variant = "primary" }: Props) {
  const mobile = useMobile();
  const content = (
    <div>
      {body && <p className="mb-5 text-[13.5px] font-bold leading-7 text-ink-500">{body}</p>}
      <div className="flex gap-2.5">
        <Button full variant={variant} onClick={() => { onConfirm(); onClose(); }}>{confirmLabel}</Button>
        <Button full variant="outline" onClick={onClose}>انصراف</Button>
      </div>
    </div>
  );
  if (mobile) return <BottomSheet open={open} onClose={onClose} title={title}>{content}</BottomSheet>;
  return <Modal open={open} onClose={onClose} title={title}>{content}</Modal>;
}
