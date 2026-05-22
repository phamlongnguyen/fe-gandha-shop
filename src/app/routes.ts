export type Route =
  | 'dashboard'
  | 'pos'
  | 'inventory'
  | 'qr'
  | 'purchase'
  | 'promo'
  | 'analytics'
  | 'orders'
  | 'customers'
  | 'settings';

export interface RouteOption {
  value: Route;
  label: string;
}

export const ROUTE_OPTIONS: RouteOption[] = [
  { value: 'dashboard', label: 'Tổng quan' },
  { value: 'pos', label: 'Bán hàng (POS)' },
  { value: 'inventory', label: 'Sản phẩm & Kho' },
  { value: 'qr', label: 'Mã QR & In tem' },
  { value: 'purchase', label: 'Nhập hàng' },
  { value: 'promo', label: 'Khuyến mãi' },
  { value: 'analytics', label: 'Phân tích' },
  { value: 'orders', label: 'Lịch sử đơn' },
  { value: 'customers', label: 'Khách hàng' },
  { value: 'settings', label: 'Cài đặt' },
];
