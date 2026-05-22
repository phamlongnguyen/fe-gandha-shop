export type PurchaseStatus = 'Đã nhập' | 'Đang giao';

export interface Purchase {
  id: string;
  time: string;
  supplier: string;
  items: number;
  total: number;
  status: PurchaseStatus;
}
