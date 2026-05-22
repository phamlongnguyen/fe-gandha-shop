export type ProductPromoType = 'percent' | 'fixed';

export interface ProductPromo {
  type: ProductPromoType;
  value: number;
  label?: string;
  end?: string;
}

export type ShopPromoType = 'percent' | 'fixed' | 'bogo';

export interface ShopPromo {
  id: string;
  code: string;
  name: string;
  type: ShopPromoType;
  value: number;
  scope: string;
  min: number;
  used: number;
  active: boolean;
  end: string;
}

export interface ProductPromoEffect {
  price: number;
  original: number;
  off: number;
  hasPromo: boolean;
  promo?: ProductPromo;
}
