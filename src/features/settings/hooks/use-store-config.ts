import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/supabase';

type StoreConfig = Database['public']['Tables']['store_config']['Row'];
type StoreConfigUpdate = Database['public']['Tables']['store_config']['Update'];

export function useStoreConfig() {
  return useQuery({
    queryKey: ['store_config'],
    queryFn: async (): Promise<StoreConfig> => {
      const { data, error } = await supabase
        .from('store_config')
        .select('*')
        .eq('id', 'singleton')
        .single();
      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60_000,
  });
}

export function useUpdateStoreConfig() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (patch: Omit<StoreConfigUpdate, 'id' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('store_config')
        .update(patch)
        .eq('id', 'singleton')
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['store_config'] }),
  });
}

export function useDevices() {
  return useQuery({
    queryKey: ['devices'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('devices')
        .select('*')
        .order('type');
      if (error) throw error;
      return data;
    },
  });
}

export function useUpdateDeviceStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'connected' | 'disconnected' | 'error' }) => {
      const { error } = await supabase.from('devices').update({ status }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['devices'] }),
  });
}

export function useInviteStaff() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      email: string;
      fullName: string;
      role: 'owner' | 'staff';
      shift?: string;
      color?: string;
    }) => {
      const { data, error } = await supabase.functions.invoke('invite-staff', {
        body: {
          email: input.email,
          full_name: input.fullName,
          role: input.role,
          shift: input.shift,
          color: input.color,
        },
      });
      if (error) throw error;
      return data as { user_id: string; temp_password?: string };
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['staff'] }),
  });
}
