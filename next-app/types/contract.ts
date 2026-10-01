export type ContractType = "volume" | "unit_price" | "other";
export type ContractStatus = "active" | "completed" | "terminated";

export interface Contract {
  _id: string;
  title: string;
  contractType: ContractType;
  contractorCompanyId: string;
  startDate: string; // کلید شمسی YYYY-MM-DD
  endDate: string;
  status: ContractStatus;
  publicNotes?: string;
  isActive: boolean;
  createdAt: string;
  contractorName?: string;
}

export const CONTRACT_TYPE_LABEL: Record<ContractType, string> = {
  volume: "حجمی",
  unit_price: "فهرست بهایی",
  other: "سایر",
};

export const CONTRACT_STATUS_LABEL: Record<ContractStatus, string> = {
  active: "فعال",
  completed: "تکمیل‌شده",
  terminated: "خاتمه‌یافته",
};
