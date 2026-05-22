import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { ShopPromo, ShopPromoType, ProductPromo, ProductPromoType } from '@/types';
import type { Database, Json } from '@/types/supabase';

type ShopPromoUpdate = Database['public']['Tables']['shop_promos']['Update'];

function mapShopPromo(r: Database['public']['Tables']['shop_promos']['Row']): ShopPromo {
  return {
    id: r.id,
    code: r.code,
    name: r.name ?? '',
    type: r.type as ShopPromoType,
    value: Number(r.value),
    scope: r.scope,
    min: Number(r.min_order_amount),
    used: r.times_used,
    active: r.is_active,
    end: r.expires_at ?? '',
  };
}

export function useShopPromos() {
  return useQuery({
    queryKey: ['promos', 'shop'],
    queryFn: async (): Promise<ShopPromo[]> => {
      const { data, error } = await supabase
        .from('shop_promos')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data.map(mapShopPromo);
    },
  });
}

export function useActiveShopPromos() {
  return useQuery({
    queryKey: ['promos', 'shop', 'active'],
    queryFn: async (): Promise<ShopPromo[]> => {
      const { data, error } = await supabase
        .from('shop_promos')
        .select('*')
        .eq('is_active', true)
        .or(`expires_at.is.null,expires_at.gte.${new Date().toISOString().slice(0, 10)}`)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data.map(mapShopPromo);
    },
    staleTime: 60_000,
  });
}

export interface ShopPromoDraft {
  code: string;
  name: string;
  type: ShopPromoType;
  value: number;
  scope: string;
  min: number;
  end: string;
  active: boolean;
}

export function useCreateShopPromo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (draft: ShopPromoDraft) => {
      const { data, error } = await supabase.from('shop_promos').insert({
        code: draft.code.toUpperCase(),
        name: draft.name,
        type: draft.type,
        value: draft.value,
        scope: draft.scope,
        min_order_amount: draft.min,
        expires_at: draft.end || null,
        is_active: draft.active,
      }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['promos'] }),
  });
}

export function useUpdateShopPromo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Partial<ShopPromoDraft> }) => {
      const update: ShopPromoUpdate = {};
      if (patch.code !== undefined) update.code = patch.code.toUpperCase();
      if (patch.name !== undefined) update.name = patch.name;
      if (patch.type !== undefined) update.type = patch.type;
      if (patch.value !== undefined) update.value = patch.value;
      if (patch.scope !== undefined) update.scope = patch.scope;
      if (patch.min !== undefined) update.min_order_amount = patch.min;
      if (patch.end !== undefined) update.expires_at = patch.end || null;
      if (patch.active !== undefined) update.is_active = patch.active;
      const { data, error } = await supabase.from('shop_promos').update(update).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['promos'] }),
  });
}

export function useDeleteShopPromo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('shop_promos').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['promos'] }),
  });
}

export interface ValidatePromoResult {
  valid: boolean;
  discount: number;
  reason: string | null;
}

export function useValidatePromo() {
  return useMutation({
    mutationFn: async (input: {
      code: string;
      subtotal: number;
      items?: { product_id: string; quantity: number; category_id?: string }[];
    }): Promise<ValidatePromoResult> => {
      const { data, error } = await supabase.rpc('validate_promo', {
        p_code: input.code,
        p_subtotal: input.subtotal,
        p_items: (input.items ?? []) as unknown as Json,
      });
      if (error) throw error;
      return data as unknown as ValidatePromoResult;
    },
  });
}

export function useUpsertProductPromo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ productId, promo }: { productId: string; promo: ProductPromo | null }) => {
      if (!promo) {
        const { error } = await supabase.from('product_promos').delete().eq('product_id', productId);
        if (error) throw error;
        return;
      }
      const { error } = await supabase.from('product_promos').upsert({
        product_id: productId,
        type: promo.type as ProductPromoType,
        value: promo.value,
        label: promo.label || null,
        expires_at: promo.end || null,
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['products'] }),
  });
}
