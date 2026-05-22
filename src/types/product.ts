import type { ProductPromo } from './promo';

export interface Product {
  id: string;
  sku: string;
  name: string;
  cat: string;
  unit: string;
  cost: number;
  price: number;
  stock: number;
  min: number;
  sold30: number;
  service?: boolean;
  promo?: ProductPromo;
}

export interface CartItem extends Product {
  qty: number;
  original?: number;
  hasPromo?: boolean;
  promoLabel?: string;
}
