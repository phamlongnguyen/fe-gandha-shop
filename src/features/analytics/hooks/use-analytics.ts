import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { RevPoint } from '@/types';

export interface DashboardToday {
  revenue: number;
  profit: number;
  order_count: number;
  low_stock_count: number;
  vs_yesterday_pct: { revenue: number; profit: number };
}

export function useDashboardToday() {
  return useQuery({
    queryKey: ['analytics', 'today'],
    queryFn: async (): Promise<DashboardToday> => {
      const { data, error } = await supabase.rpc('dashboard_today');
      if (error) throw error;
      return data as unknown as DashboardToday;
    },
    refetchInterval: 60_000,
  });
}

export function useRevenueSeries(days: number) {
  const from = new Date(Date.now() - days * 86_400_000).toISOString().slice(0, 10);
  const to = new Date().toISOString().slice(0, 10);
  return useQuery({
    queryKey: ['analytics', 'revenue', days],
    queryFn: async (): Promise<RevPoint[]> => {
      const { data, error } = await supabase
        .from('v_analytics_daily')
        .select('d, revenue, cost, profit, order_count')
        .gte('d', from)
        .lte('d', to)
        .order('d');
      if (error) throw error;
      return data.map((r) => ({
        d: r.d ?? '',
        rev: Number(r.revenue ?? 0) / 1000,
        cost: Number(r.cost ?? 0) / 1000,
        profit: Number(r.profit ?? 0) / 1000,
      }));
    },
  });
}

export interface CategoryStat {
  category_id: string;
  category_name: string;
  category_slug: string;
  revenue: number;
  cost: number;
  profit: number;
  qty_sold: number;
}

export function useCategoryStats(days: number) {
  const from = new Date(Date.now() - days * 86_400_000).toISOString().slice(0, 10);
  const to = new Date().toISOString().slice(0, 10);
  return useQuery({
    queryKey: ['analytics', 'categories', days],
    queryFn: async (): Promise<CategoryStat[]> => {
      const { data, error } = await supabase
        .from('v_analytics_by_category')
        .select('category_id, category_name, category_slug, revenue, cost, profit, qty_sold')
        .gte('d', from)
        .lte('d', to);
      if (error) throw error;
      const agg = new Map<string, CategoryStat>();
      for (const r of data) {
        const id = r.category_id ?? '';
        const cur = agg.get(id) ?? {
          category_id: id,
          category_name: r.category_name ?? '',
          category_slug: r.category_slug ?? '',
          revenue: 0, cost: 0, profit: 0, qty_sold: 0,
        };
        cur.revenue += Number(r.revenue ?? 0);
        cur.cost += Number(r.cost ?? 0);
        cur.profit += Number(r.profit ?? 0);
        cur.qty_sold += Number(r.qty_sold ?? 0);
        agg.set(id, cur);
      }
      return [...agg.values()].sort((a, b) => b.revenue - a.revenue);
    },
  });
}

export interface TopProduct {
  id: string;
  name: string;
  sku: string;
  unit: string;
  qty_sold: number;
  revenue: number;
  profit: number;
}

export function useTopProducts(days: number, sort: 'profit' | 'quantity' | 'revenue' = 'profit', limit = 10) {
  const from = new Date(Date.now() - days * 86_400_000).toISOString().slice(0, 10);
  const to = new Date().toISOString().slice(0, 10);
  return useQuery({
    queryKey: ['analytics', 'top-products', days, sort, limit],
    queryFn: async (): Promise<TopProduct[]> => {
      const { data, error } = await supabase.rpc('top_products', {
        p_from: from,
        p_to: to,
        p_sort: sort,
        p_limit: limit,
      });
      if (error) throw error;
      return data.map((r) => ({
        id: r.id,
        name: r.name,
        sku: r.sku,
        unit: r.unit,
        qty_sold: r.qty_sold,
        revenue: Number(r.revenue),
        profit: Number(r.profit),
      }));
    },
  });
}
