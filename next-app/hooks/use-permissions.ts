"use client";
import { useAuthStore } from "@/stores/auth-store";
import type { Role } from "@/types";

export function usePermissions() {
  const me = useAuthStore((s) => s.me);
  const role = me?.role;
  return {
    role,
    is: (...roles: Role[]) => !!role && roles.includes(role),
    canCreateTask: ["EMPLOYER_EXPERT", "EMPLOYER_CEO", "GROUP_SUPERVISOR", "CONTRACTOR_CEO"].includes(role as Role),
    canCreatePurchase: ["TECHNICIAN", "GROUP_SUPERVISOR", "RESIDENT_REP"].includes(role as Role),
    canDecidePurchase: ["RESIDENT_REP", "CONTRACTOR_CEO"].includes(role as Role),
    canRegisterReport: ["TECHNICIAN", "GROUP_SUPERVISOR"].includes(role as Role),
  };
}
