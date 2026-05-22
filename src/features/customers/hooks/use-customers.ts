import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/supabase';
import type { Customer, CustomerTag } from '@/types';

type CustomersUpdate = Database['public']['Tables']['customers']['Update'];

type RawCustomer = {
  id: string;
  name: string;
  phone: string | null;
  address: string | null;
  note: string | null;
};

function inferTag(note: string | null): CustomerTag {
  const tag = note?.trim();
  if (tag === 'VIP' || tag === 'B2B' || tag === 'Thân' || tag === 'Mới') return tag;
  return 'Mới';
}

function mapCustomer(r: RawCustomer): Customer {
  return {
    id: r.id,
    name: r.name,
    phone: r.phone ?? '',
    orders: 0,
    spent: 0,
    lastVisit: '—',
    tag: inferTag(r.note),
  };
}

export function useCustomers() {
  return useQuery({
    queryKey: ['customers'],
    queryFn: async (): Promise<Customer[]> => {
      const { data, error } = await supabase
        .from('customers')
        .select('id, name, phone, address, note')
        .order('name');
      if (error) throw error;
      return data.map(mapCustomer);
    },
  });
}

export interface CustomerDraft {
  name: string;
  phone?: string;
  tag?: CustomerTag;
  address?: string;
}

export function useCreateCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (draft: CustomerDraft) => {
      const { data, error } = await supabase
        .from('customers')
        .insert({
          name: draft.name,
          phone: draft.phone || null,
          address: draft.address || null,
          note: draft.tag ?? null,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['customers'] }),
  });
}

export function useUpdateCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Partial<CustomerDraft> }) => {
      const update: CustomersUpdate = {};
      if (patch.name !== undefined) update.name = patch.name;
      if (patch.phone !== undefined) update.phone = patch.phone || null;
      if (patch.address !== undefined) update.address = patch.address || null;
      if (patch.tag !== undefined) update.note = patch.tag;
      const { data, error } = await supabase
        .from('customers')
        .update(update)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['customers'] }),
  });
}

export function useDeleteCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('customers').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['customers'] }),
  });
}
