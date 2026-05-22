import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/supabase';
import type { Product } from '@/types';

type ProductsUpdate = Database['public']['Tables']['products']['Update'];

type RawProduct = {
  id: string;
  sku: string | null;
  name: string;
  cost: number;
  price: number;
  stock: number;
  category_id: string | null;
  image_url: string | null;
  is_active: boolean;
  category: { id: string; slug: string } | null;
};

function mapProduct(r: RawProduct): Product {
  return {
    id: r.id,
    sku: r.sku ?? '',
    name: r.name,
    cat: r.category?.slug ?? '',
    unit: 'cái',
    cost: Number(r.cost),
    price: Number(r.price),
    stock: r.stock,
    min: 0,
    sold30: 0,
  };
}

export function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: async (): Promise<Product[]> => {
      const { data, error } = await supabase
        .from('products')
        .select('id, sku, name, cost, price, stock, category_id, image_url, is_active, category:categories(id, slug)')
        .eq('is_active', true)
        .order('name');
      if (error) throw error;
      return (data as unknown as RawProduct[]).map(mapProduct);
    },
  });
}

export interface ProductDraft {
  name: string;
  sku: string;
  cat: string;
  cost: number;
  price: number;
  stock: number;
}

async function resolveCategoryRowId(slug: string): Promise<string | null> {
  if (!slug) return null;
  const { data, error } = await supabase
    .from('categories')
    .select('id')
    .eq('slug', slug)
    .single();
  if (error) return null;
  return data.id;
}

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (draft: ProductDraft) => {
      const category_id = await resolveCategoryRowId(draft.cat);
      const { data, error } = await supabase
        .from('products')
        .insert({
          name: draft.name,
          sku: draft.sku || null,
          cost: draft.cost,
          price: draft.price,
          stock: draft.stock,
          category_id,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['products'] }),
  });
}

export function useUpdateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Partial<ProductDraft> }) => {
      const update: ProductsUpdate = {};
      if (patch.name !== undefined) update.name = patch.name;
      if (patch.sku !== undefined) update.sku = patch.sku || null;
      if (patch.cost !== undefined) update.cost = patch.cost;
      if (patch.price !== undefined) update.price = patch.price;
      if (patch.stock !== undefined) update.stock = patch.stock;
      if (patch.cat !== undefined) {
        update.category_id = await resolveCategoryRowId(patch.cat);
      }
      const { data, error } = await supabase
        .from('products')
        .update(update)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['products'] }),
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('products')
        .update({ is_active: false })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['products'] }),
  });
}

export function useAdjustStock() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      productId: string;
      changeType: 'in' | 'out' | 'adjust';
      quantity: number;
      note?: string;
    }) => {
      const { data, error } = await supabase.rpc('adjust_stock', {
        p_product_id: input.productId,
        p_change_type: input.changeType,
        p_quantity: input.quantity,
        p_note: input.note,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['products'] }),
  });
}
