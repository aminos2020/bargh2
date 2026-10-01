export interface PriceItem {
  _id: string;
  code: string;
  title: string;
  unit: string;
  unitPrice: number; // ریال
  contractId: string;
  groupIds: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  groupNames?: string[];
}
