import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/supabase';
import type { Product, ProductPromo, ProductPromoType } from '@/types';

type ProductsUpdate = Database['public']['Tables']['products']['Update'];

type RawProduct = {
  id: string;
  sku: string | null;
  name: string;
  cost: number;
  price: number;
  stock: number;
  min_stock: number;
  is_service: boolean;
  unit: string;
  category_id: string | null;
  image_url: string | null;
  is_active: boolean;
  category: { id: string; slug: string } | null;
  promo: {
    type: string;
    value: number;
    label: string | null;
    expires_at: string | null;
  } | null;
  sold: { qty_sold_30d: number | null } | null;
};

function mapProduct(r: RawProduct): Product {
  const p: Product = {
    id: r.id,
    sku: r.sku ?? '',
    name: r.name,
    cat: r.category?.slug ?? '',
    unit: r.unit,
    cost: Number(r.cost),
    price: Number(r.price),
    stock: r.stock,
    min: r.min_stock,
    sold30: r.sold?.qty_sold_30d ?? 0,
    service: r.is_service,
  };
  if (r.promo) {
    p.promo = {
      type: r.promo.type as ProductPromoType,
      value: Number(r.promo.value),
      label: r.promo.label ?? undefined,
      end: r.promo.expires_at ?? undefined,
    };
  }
  return p;
}

/**
 * Embedded `category` join. Pass `inner=true` when filtering by `category.slug`
 * to avoid PostgREST returning rows with `category_id IS NULL`
 * (and bogus count). See docs/fe-requirements/verify-embedded-filter.md.
 */
function productSelect(inner = false): string {
  const catEmbed = inner ? 'category:categories!inner(id, slug)' : 'category:categories(id, slug)';
  return (
    'id, sku, name, cost, price, stock, min_stock, is_service, unit, category_id, image_url, is_active, ' +
    catEmbed + ', ' +
    'promo:product_promos(type, value, label, expires_at), ' +
    'sold:v_products_sold_30d(qty_sold_30d)'
  );
}

/** Returns full list (capped 1000) for client-side filtering. Use for dropdowns / low-stock cards. */
export function useProducts() {
  return useQuery({
    queryKey: ['products', 'all'],
    queryFn: async (): Promise<Product[]> => {
      const { data, error } = await supabase
        .from('products')
        .select(productSelect(false))
        .eq('is_active', true)
        .order('name')
        .limit(1000);
      if (error) throw error;
      return (data as unknown as RawProduct[]).map(mapProduct);
    },
  });
}

export interface ProductsPagedOptions {
  page: number;
  pageSize: number;
  search?: string;
  /** category slug like 'vpp', 'photo'. 'all' = no filter */
  cat?: string;
}

/** Paginated + server-side searched list. Use for Inventory table. */
export function useProductsPaged({ page, pageSize, search = '', cat = 'all' }: ProductsPagedOptions) {
  return useQuery({
    queryKey: ['products', 'paged', { page, pageSize, search, cat }],
    queryFn: async (): Promise<{ rows: Product[]; total: number }> => {
      const filteringByCategory = cat !== 'all';
      let q = supabase
        .from('products')
        .select(productSelect(filteringByCategory), { count: 'exact' })
        .eq('is_active', true);
      if (filteringByCategory) q = q.eq('category.slug', cat);
      if (search.trim()) {
        const s = search.replace(/[%_]/g, '\\$&');
        q = q.or(`name.ilike.%${s}%,sku.ilike.%${s}%`);
      }
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      const { data, error, count } = await q.order('name').range(from, to);
      if (error) throw error;
      return {
        rows: (data as unknown as RawProduct[]).map(mapProduct),
        total: count ?? 0,
      };
    },
  });
}

export interface ProductsInfiniteOptions {
  pageSize?: number;
  search?: string;
  cat?: string;
}

/** Infinite list for mobile screens. Returns flat array + fetchNextPage helpers. */
export function useProductsInfinite({ pageSize = 30, search = '', cat = 'all' }: ProductsInfiniteOptions = {}) {
  return useInfiniteQuery({
    queryKey: ['products', 'infinite', { pageSize, search, cat }],
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const filteringByCategory = cat !== 'all';
      let q = supabase
        .from('products')
        .select(productSelect(filteringByCategory), { count: 'exact' })
        .eq('is_active', true);
      if (filteringByCategory) q = q.eq('category.slug', cat);
      if (search.trim()) {
        const s = search.replace(/[%_]/g, '\\$&');
        q = q.or(`name.ilike.%${s}%,sku.ilike.%${s}%`);
      }
      const from = (pageParam - 1) * pageSize;
      const to = from + pageSize - 1;
      const { data, error, count } = await q.order('name').range(from, to);
      if (error) throw error;
      const rows = (data as unknown as RawProduct[]).map(mapProduct);
      return { rows, total: count ?? 0, page: pageParam };
    },
    getNextPageParam: (last) => {
      const loaded = last.page * pageSize;
      return loaded < last.total ? last.page + 1 : undefined;
    },
  });
}

export interface ProductDraft {
  name: string;
  sku: string;
  cat: string;
  unit: string;
  cost: number;
  price: number;
  stock: number;
  min: number;
  service: boolean;
  promo?: ProductPromo | null;
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

async function upsertPromo(productId: string, promo: ProductPromo | null | undefined) {
  if (!promo || !promo.value) {
    await supabase.from('product_promos').delete().eq('product_id', productId);
    return;
  }
  await supabase.from('product_promos').upsert({
    product_id: productId,
    type: promo.type,
    value: promo.value,
    label: promo.label || null,
    expires_at: promo.end || null,
  });
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
          min_stock: draft.min,
          is_service: draft.service,
          unit: draft.unit || 'cái',
          category_id,
        })
        .select()
        .single();
      if (error) throw error;
      await upsertPromo(data.id, draft.promo ?? null);
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
      if (patch.min !== undefined) update.min_stock = patch.min;
      if (patch.service !== undefined) update.is_service = patch.service;
      if (patch.unit !== undefined) update.unit = patch.unit || 'cái';
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
      if (patch.promo !== undefined) {
        await upsertPromo(id, patch.promo);
      }
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
