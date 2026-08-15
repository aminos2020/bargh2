"use client";
import { useEffect } from "react";

/** اطمینان از جهت RTL و زبان فارسی در سمت کلاینت */
export function useRtl() {
  useEffect(() => {
    document.documentElement.dir = "rtl";
    document.documentElement.lang = "fa";
  }, []);
}
