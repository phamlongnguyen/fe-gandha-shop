import type { ShopPromo } from '@/types';

export const PROMOS: ShopPromo[] = [
  { id: 'pr1', code: 'KHAITRUONG', name: 'Khai trương -10% toàn shop', type: 'percent', value: 10, scope: 'all', min: 50000, used: 84, active: true, end: '2026-05-31' },
  { id: 'pr2', code: 'VPPHE2026', name: 'Mùa tựu trường VPP -15%', type: 'percent', value: 15, scope: 'cat:vpp', min: 100000, used: 142, active: true, end: '2026-09-15' },
  { id: 'pr3', code: 'BAG50K', name: 'Giảm 50K cho túi >300K', type: 'fixed', value: 50000, scope: 'cat:bag', min: 300000, used: 26, active: true, end: '2026-06-30' },
  { id: 'pr4', code: 'COMBO3', name: 'Mua 3 tặng 1 — bút bi', type: 'bogo', value: 3, scope: 'sku:p01', min: 0, used: 38, active: true, end: '2026-12-31' },
  { id: 'pr5', code: 'SHOEPHOTO', name: 'Combo giày + photocopy -5%', type: 'percent', value: 5, scope: 'all', min: 200000, used: 12, active: false, end: '2026-04-15' },
];
