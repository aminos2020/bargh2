"use client";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Trash2, X } from "lucide-react";
import type { PickedImage } from "./file-uploader";

interface Props {
  images: (PickedImage | { dataUrl: string; fileName?: string })[];
  onRemove?: (idx: number) => void;
}

export function ImagePreviewGallery({ images, onRemove }: Props) {
  const [preview, setPreview] = useState<string | null>(null);
  if (images.length === 0) return null;
  return (
    <>
      <div className="flex flex-wrap gap-2.5">
        {images.map((img, i) => (
          <div key={i} className="anim-scale-in group relative h-20 w-20 overflow-hidden rounded-[14px] border border-line">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img.dataUrl} alt={img.fileName || "عکس"} className="h-full w-full cursor-pointer object-cover" onClick={() => setPreview(img.dataUrl)} />
            {onRemove && (
              <button
                type="button"
                aria-label="حذف عکس"
                onClick={() => onRemove(i)}
                className="press absolute end-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-ink-900/70 text-white opacity-0 transition-opacity group-hover:opacity-100 max-md:opacity-100"
              >
                <Trash2 size={13} />
              </button>
            )}
          </div>
        ))}
      </div>
      <AnimatePresence>
        {preview && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] flex items-center justify-center bg-ink-900/85 p-6"
            onClick={() => setPreview(null)}
          >
            <button className="absolute end-5 top-5 text-white" aria-label="بستن"><X size={26} /></button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="پیش‌نمایش" className="max-h-[85vh] max-w-full rounded-card object-contain" />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
