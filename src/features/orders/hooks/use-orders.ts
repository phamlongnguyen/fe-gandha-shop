import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { OrderSummary } from '@/types';

const METHOD_LABEL: Record<string, string> = {
  cash: 'Tiền mặt',
  transfer: 'Chuyển khoản',
  card: 'Quẹt thẻ',
  other: 'Khác',
};

type RawOrder = {
  id: string;
  total: number;
  cost_total: number;
  payment_method: string;
  status: string;
  promo_code: string | null;
  promo_amount: number;
  discount_amount: number;
  created_at: string;
  customer: { name: string } | null;
  creator: { full_name: string } | null;
  items: { quantity: number }[];
};

function formatTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  const yest = new Date(now);
  yest.setDate(yest.getDate() - 1);
  const isYest = d.toDateString() === yest.toDateString();
  const hh = d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  if (sameDay) return `Hôm nay ${hh}`;
  if (isYest) return `Hôm qua ${hh}`;
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }) + ` ${hh}`;
}

export function shortOrderId(uuid: string): string {
  return uuid.slice(0, 8).toUpperCase();
}

function mapOrder(r: RawOrder): OrderSummary {
  return {
    id: r.id,
    time: formatTime(r.created_at),
    items: r.items.reduce((s, i) => s + i.quantity, 0),
    total: Number(r.total),
    profit: Number(r.total) - Number(r.cost_total),
    method: METHOD_LABEL[r.payment_method] ?? r.payment_method,
    staff: r.creator?.full_name ?? '—',
    customer: r.customer?.name ?? 'Khách lẻ',
  };
}

const ORDER_SELECT =
  'id, total, cost_total, payment_method, status, promo_code, promo_amount, discount_amount, created_at, ' +
  'customer:customers(name), creator:profiles(full_name), items:order_items(quantity)';

export interface OrdersOptions {
  page?: number;
  pageSize?: number;
  paymentMethod?: 'cash' | 'transfer' | 'card' | 'other';
}

export function useOrders(opts: OrdersOptions = {}) {
  const { page = 1, pageSize = 50, paymentMethod } = opts;
  return useQuery({
    queryKey: ['orders', { page, pageSize, paymentMethod }],
    queryFn: async (): Promise<{ rows: OrderSummary[]; total: number }> => {
      let q = supabase
        .from('orders')
        .select(ORDER_SELECT, { count: 'exact' })
        .order('created_at', { ascending: false });
      if (paymentMethod) q = q.eq('payment_method', paymentMethod);
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      const { data, error, count } = await q.range(from, to);
      if (error) throw error;
      return {
        rows: (data as unknown as RawOrder[]).map(mapOrder),
        total: count ?? 0,
      };
    },
  });
}

export function useOrder(id: string | undefined) {
  return useQuery({
    queryKey: ['orders', id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(
          'id, total, cost_total, subtotal, payment_method, status, promo_code, promo_amount, discount_pct, discount_amount, received_amount, change_amount, created_at, ' +
            'customer:customers(name, phone), creator:profiles(full_name), ' +
            'items:order_items(id, quantity, unit_price, subtotal, product:products(id, name, sku, unit))',
        )
        .eq('id', id!)
        .single();
      if (error) throw error;
      return data;
    },
  });
}

export function useCancelOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { orderId: string; reason?: string }) => {
      const { error } = await supabase.rpc('cancel_order', {
        p_order_id: input.orderId,
        p_reason: input.reason,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['orders'] });
      qc.invalidateQueries({ queryKey: ['products'] });
      qc.invalidateQueries({ queryKey: ['analytics'] });
    },
  });
}
