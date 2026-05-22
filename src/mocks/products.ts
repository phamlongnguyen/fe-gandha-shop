import type { Product } from '@/types';
import { makeSku } from '@/lib/format';

const sku = makeSku;

export const PRODUCTS: Product[] = [
  // VPP
  { id: 'p01', sku: sku('vpp', 1), name: 'Bút bi Thiên Long TL-027', cat: 'vpp', unit: 'cây', cost: 3000, price: 5000, stock: 248, min: 50, sold30: 412 },
  { id: 'p02', sku: sku('vpp', 2), name: 'Vở học sinh Hồng Hà 200 trang', cat: 'vpp', unit: 'quyển', cost: 14000, price: 22000, stock: 86, min: 30, sold30: 124, promo: { type: 'percent', value: 15, label: 'Tựu trường', end: '2026-09-15' } },
  { id: 'p03', sku: sku('vpp', 3), name: 'Tẩy chì Pentel ZEH-05', cat: 'vpp', unit: 'cái', cost: 5500, price: 9000, stock: 142, min: 40, sold30: 78 },
  { id: 'p04', sku: sku('vpp', 4), name: 'Thước kẻ nhựa 30cm', cat: 'vpp', unit: 'cái', cost: 4000, price: 7000, stock: 64, min: 20, sold30: 45 },
  { id: 'p05', sku: sku('vpp', 5), name: 'Bút lông Thiên Long PM-09', cat: 'vpp', unit: 'cây', cost: 6500, price: 11000, stock: 18, min: 30, sold30: 92, promo: { type: 'fixed', value: 2000, label: 'Xả tồn', end: '2026-05-20' } },
  { id: 'p06', sku: sku('vpp', 6), name: 'Giấy A4 Double A 70gsm 500 tờ', cat: 'vpp', unit: 'ream', cost: 72000, price: 89000, stock: 34, min: 10, sold30: 58 },
  { id: 'p07', sku: sku('vpp', 7), name: 'Bìa hồ sơ nút bấm A4', cat: 'vpp', unit: 'cái', cost: 3500, price: 6000, stock: 102, min: 30, sold30: 61 },
  { id: 'p08', sku: sku('vpp', 8), name: 'Hộp bút màu Colokit 12 màu', cat: 'vpp', unit: 'hộp', cost: 28000, price: 42000, stock: 29, min: 10, sold30: 18, promo: { type: 'percent', value: 20, label: 'Tựu trường', end: '2026-09-15' } },

  // Photocopy & In ấn
  { id: 'p09', sku: sku('photo', 1), name: 'Photocopy A4 trắng đen', cat: 'photo', unit: 'tờ', cost: 200, price: 500, stock: 9999, min: 0, sold30: 3240, service: true },
  { id: 'p10', sku: sku('photo', 2), name: 'Photocopy A4 màu', cat: 'photo', unit: 'tờ', cost: 1500, price: 3000, stock: 9999, min: 0, sold30: 890, service: true },
  { id: 'p11', sku: sku('photo', 3), name: 'In A4 trắng đen', cat: 'photo', unit: 'tờ', cost: 400, price: 1000, stock: 9999, min: 0, sold30: 2150, service: true },
  { id: 'p12', sku: sku('photo', 4), name: 'In A4 màu', cat: 'photo', unit: 'tờ', cost: 2500, price: 5000, stock: 9999, min: 0, sold30: 640, service: true },
  { id: 'p13', sku: sku('photo', 5), name: 'Đóng bìa kim loại', cat: 'photo', unit: 'cuốn', cost: 4000, price: 12000, stock: 9999, min: 0, sold30: 142, service: true },
  { id: 'p14', sku: sku('photo', 6), name: 'Ép plastic A4', cat: 'photo', unit: 'tờ', cost: 3000, price: 8000, stock: 9999, min: 0, sold30: 286, service: true },

  // Giày dép
  { id: 'p15', sku: sku('shoe', 1), name: 'Dép tổ ong Thái Lan size 38-42', cat: 'shoe', unit: 'đôi', cost: 35000, price: 65000, stock: 42, min: 15, sold30: 38 },
  { id: 'p16', sku: sku('shoe', 2), name: 'Sandal nữ quai chéo size 36-39', cat: 'shoe', unit: 'đôi', cost: 120000, price: 189000, stock: 18, min: 8, sold30: 12, promo: { type: 'percent', value: 25, label: 'Sale hè', end: '2026-06-30' } },
  { id: 'p17', sku: sku('shoe', 3), name: 'Giày sneaker nam vải canvas', cat: 'shoe', unit: 'đôi', cost: 185000, price: 289000, stock: 24, min: 10, sold30: 16 },
  { id: 'p18', sku: sku('shoe', 4), name: 'Dép nhựa đi mưa size 36-44', cat: 'shoe', unit: 'đôi', cost: 28000, price: 49000, stock: 56, min: 20, sold30: 42 },
  { id: 'p19', sku: sku('shoe', 5), name: 'Giày tây nam da PU đen', cat: 'shoe', unit: 'đôi', cost: 240000, price: 389000, stock: 9, min: 5, sold30: 7, promo: { type: 'fixed', value: 50000, label: 'Xả tồn', end: '2026-05-31' } },
  { id: 'p20', sku: sku('shoe', 6), name: 'Dép kẹp nam đế cao su', cat: 'shoe', unit: 'đôi', cost: 22000, price: 39000, stock: 78, min: 25, sold30: 54 },

  // Túi xách
  { id: 'p21', sku: sku('bag', 1), name: 'Cặp học sinh chống gù 3 ngăn', cat: 'bag', unit: 'cái', cost: 185000, price: 289000, stock: 22, min: 10, sold30: 19 },
  { id: 'p22', sku: sku('bag', 2), name: 'Balo laptop nam unisex 15.6"', cat: 'bag', unit: 'cái', cost: 220000, price: 359000, stock: 16, min: 8, sold30: 11 },
  { id: 'p23', sku: sku('bag', 3), name: 'Túi tote vải canvas in họa tiết', cat: 'bag', unit: 'cái', cost: 45000, price: 89000, stock: 38, min: 15, sold30: 28, promo: { type: 'percent', value: 10, label: 'Yeu thich' } },
  { id: 'p24', sku: sku('bag', 4), name: 'Túi đeo chéo nữ da PU', cat: 'bag', unit: 'cái', cost: 140000, price: 229000, stock: 7, min: 10, sold30: 14 },
  { id: 'p25', sku: sku('bag', 5), name: 'Ví nam da bò mini', cat: 'bag', unit: 'cái', cost: 95000, price: 159000, stock: 19, min: 8, sold30: 10, promo: { type: 'fixed', value: 30000, label: 'Combo', end: '2026-06-30' } },
  { id: 'p26', sku: sku('bag', 6), name: 'Túi rút thể thao chống nước', cat: 'bag', unit: 'cái', cost: 38000, price: 75000, stock: 31, min: 12, sold30: 22 },
];
