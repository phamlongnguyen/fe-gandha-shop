import type { Customer } from '@/types';

export const CUSTOMERS: Customer[] = [
  { id: 'c1', name: 'Cô Hằng (gần nhà)', phone: '0912 *** 487', orders: 38, spent: 4280000, lastVisit: '2 ngày trước', tag: 'VIP' },
  { id: 'c2', name: 'Anh Tuấn', phone: '0987 *** 112', orders: 24, spent: 3120000, lastVisit: 'Hôm qua', tag: 'VIP' },
  { id: 'c3', name: 'Trường Tiểu học Sao Mai', phone: '028 *** 9920', orders: 12, spent: 8940000, lastVisit: '1 tuần', tag: 'B2B' },
  { id: 'c4', name: 'Chị Lan photocopy', phone: '0908 *** 365', orders: 56, spent: 1840000, lastVisit: 'Hôm nay', tag: 'Thân' },
  { id: 'c5', name: 'Bạn Minh sinh viên', phone: '0376 *** 044', orders: 9, spent: 720000, lastVisit: '3 ngày', tag: 'Mới' },
  { id: 'c6', name: 'Bác Tài taxi', phone: '0901 *** 778', orders: 14, spent: 1260000, lastVisit: '5 ngày', tag: 'Thân' },
];
