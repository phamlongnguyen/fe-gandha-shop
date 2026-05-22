import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Category } from '@/types';

const ICON_BY_SLUG: Record<string, string> = {
  vpp: '✎',
  photo: '⎙',
  shoe: '◐',
  bag: '◇',
};

export interface CategoryWithRowId extends Category {
  rowId: string;
}

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async (): Promise<CategoryWithRowId[]> => {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name, slug')
        .order('slug');
      if (error) throw error;
      return data.map((c) => ({
        id: c.slug,
        rowId: c.id,
        name: c.name,
        icon: ICON_BY_SLUG[c.slug] ?? '•',
      }));
    },
    staleTime: 5 * 60_000,
  });
}

export function useCategoryRowIdBySlug(slug: string | undefined) {
  const { data: categories } = useCategories();
  return categories?.find((c) => c.id === slug)?.rowId;
}
