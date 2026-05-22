export type CustomerTag = 'VIP' | 'B2B' | 'Thân' | 'Mới';

export interface Customer {
  id: string;
  name: string;
  phone: string;
  orders: number;
  spent: number;
  lastVisit: string;
  tag: CustomerTag;
}
