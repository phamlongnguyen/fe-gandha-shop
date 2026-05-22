import type { Product, ProductPromoEffect } from '@/types';

export function applyProductPromo(p: Product): ProductPromoEffect {
  if (!p.promo) {
    return { price: p.price, original: p.price, off: 0, hasPromo: false };
  }
  const { type, value } = p.promo;
  let price = p.price;
  if (type === 'percent') {
    price = Math.round((p.price * (100 - value)) / 100 / 100) * 100;
  } else if (type === 'fixed') {
    price = Math.max(0, p.price - value);
  }
  return {
    price,
    original: p.price,
    off: p.price - price,
    hasPromo: true,
    promo: p.promo,
  };
}
