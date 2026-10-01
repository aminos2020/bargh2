"use client";
import { useMediaQuery } from "./use-media-query";

export function useMobile(): boolean {
  return !useMediaQuery("(min-width: 1024px)");
}
