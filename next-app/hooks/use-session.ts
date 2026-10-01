"use client";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth-store";
import { apiFetch } from "@/lib/api-fetch";
import type { PublicUser } from "@/types";

/** دریافت کاربر جاری از /api/v1/users/me و ذخیره در auth-store */
export function useSession() {
  const { me, setMe } = useAuthStore();
  const q = useQuery({
    queryKey: ["me"],
    queryFn: () => apiFetch<PublicUser>("/api/v1/users/me"),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
  useEffect(() => {
    if (q.data) setMe(q.data);
  }, [q.data, setMe]);
  return { me, loading: q.isLoading };
}
