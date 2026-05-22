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
  payment_method: string;
  status: string;
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
    profit: 0,
    method: METHOD_LABEL[r.payment_method] ?? r.payment_method,
    staff: r.creator?.full_name ?? '—',
    customer: r.customer?.name ?? 'Khách lẻ',
  };
}

export interface OrdersFilter {
  limit?: number;
  paymentMethod?: 'cash' | 'transfer' | 'card' | 'other';
}

export function useOrders(filter: OrdersFilter = {}) {
  return useQuery({
    queryKey: ['orders', filter],
    queryFn: async (): Promise<OrderSummary[]> => {
      let q = supabase
        .from('orders')
        .select(
          'id, total, payment_method, status, created_at, customer:customers(name), creator:profiles(full_name), items:order_items(quantity)',
        )
        .order('created_at', { ascending: false })
        .limit(filter.limit ?? 50);
      if (filter.paymentMethod) q = q.eq('payment_method', filter.paymentMethod);
      const { data, error } = await q;
      if (error) throw error;
      return (data as unknown as RawOrder[]).map(mapOrder);
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
          'id, total, payment_method, status, created_at, customer:customers(name, phone), creator:profiles(full_name), items:order_items(id, quantity, unit_price, subtotal, product:products(id, name, sku))',
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
    },
  });
}
