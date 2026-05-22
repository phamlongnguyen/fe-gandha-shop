import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Json } from '@/types/supabase';

export type PaymentMethod = 'cash' | 'transfer' | 'card' | 'other';

export interface CreateOrderItem {
  product_id: string;
  quantity: number;
}

export interface CreateOrderInput {
  items: CreateOrderItem[];
  customerId?: string | null;
  payment?: PaymentMethod;
  promoCode?: string | null;
  discountPct?: number;
  receivedAmount?: number | null;
  note?: string;
}

export function useCreateOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateOrderInput): Promise<string> => {
      const { data, error } = await supabase.rpc('create_order', {
        p_items: input.items as unknown as Json,
        p_customer_id: input.customerId ?? undefined,
        p_payment: input.payment ?? 'cash',
        p_promo_code: input.promoCode ?? undefined,
        p_discount_pct: input.discountPct ?? 0,
        p_received_amount: input.receivedAmount ?? undefined,
        p_note: input.note,
      });
      if (error) throw error;
      return data as string;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['orders'] });
      qc.invalidateQueries({ queryKey: ['products'] });
      qc.invalidateQueries({ queryKey: ['promos'] });
      qc.invalidateQueries({ queryKey: ['analytics'] });
    },
  });
}
