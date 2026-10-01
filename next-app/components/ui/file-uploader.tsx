"use client";
import { useRef, useState } from "react";
import { Camera, ImagePlus, Loader2 } from "lucide-react";
import { Button } from "./button";
import { useToast } from "./toast";

export interface PickedImage { fileName: string; mimeType: string; dataUrl: string; size: number; }

const MAX_DIM = 1280;
const MAX_SIZE = 4 * 1024 * 1024;

function compress(file: File): Promise<PickedImage> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, MAX_DIM / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("canvas"));
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.72);
        resolve({ fileName: file.name || "photo.jpg", mimeType: "image/jpeg", dataUrl, size: dataUrl.length });
      };
      img.onerror = reject;
      img.src = String(reader.result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

interface Props {
  onPick: (img: PickedImage) => void;
  withCamera?: boolean;
}

/** انتخاب/گرفتن عکس + فشرده‌سازی سمت کلاینت قبل از آپلود */
export function FileUploader({ onPick, withCamera = true }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const toast = useToast();

  const handle = async (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast("فقط فایل عکس مجاز است.", "error"); return; }
    if (file.size > 12 * 1024 * 1024) { toast("حجم عکس بیش از حد مجاز است.", "error"); return; }
    setBusy(true);
    try {
      const img = await compress(file);
      if (img.size > MAX_SIZE) { toast("عکس بعد از فشرده‌سازی هم بزرگ است.", "error"); return; }
      onPick(img);
    } catch {
      toast("پردازش عکس ناموفق بود.", "error");
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
      if (cameraRef.current) cameraRef.current.value = "";
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {withCamera && (
        <>
          <Button type="button" variant="dark" icon={busy ? <Loader2 size={18} className="animate-spin" /> : <Camera size={18} />} onClick={() => cameraRef.current?.click()}>
            دوربین
          </Button>
          {/* capture=environment دوربین عقب موبایل را سریع باز می‌کند */}
          <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => handle(e.target.files)} />
        </>
      )}
      <Button type="button" variant="soft" icon={<ImagePlus size={18} />} onClick={() => fileRef.current?.click()}>
        گالری
      </Button>
      <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => handle(e.target.files)} />
    </div>
  );
}
