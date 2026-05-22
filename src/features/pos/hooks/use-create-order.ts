import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Json } from '@/types/supabase';

export type PaymentMethod = 'cash' | 'transfer' | 'card' | 'other';

export interface CreateOrderItem {
  product_id: string;
  quantity: number;
}

export interface CreateOrderInput {
  customerId: string | null;
  items: CreateOrderItem[];
  payment: PaymentMethod;
  note?: string;
}

export function useCreateOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateOrderInput): Promise<string> => {
      const { data, error } = await supabase.rpc('create_order', {
        p_customer_id: input.customerId as string,
        p_items: input.items as unknown as Json,
        p_payment: input.payment,
        p_note: input.note,
      });
      if (error) throw error;
      return data as string;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['orders'] });
      qc.invalidateQueries({ queryKey: ['products'] });
    },
  });
}
