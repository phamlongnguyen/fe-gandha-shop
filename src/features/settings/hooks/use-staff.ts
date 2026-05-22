import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Staff } from '@/types';

const ROLE_LABEL: Record<string, string> = {
  owner: 'Chủ shop',
  staff: 'Nhân viên',
};

const PALETTE = ['#FF6B1A', '#0EA5E9', '#10B981', '#A855F7', '#F59E0B', '#EC4899'];

function colorOf(id: string): string {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  return PALETTE[Math.abs(h) % PALETTE.length];
}

type RawProfile = {
  id: string;
  full_name: string;
  role: string;
  created_at: string;
};

function mapStaff(r: RawProfile): Staff {
  return {
    id: r.id,
    name: r.full_name,
    role: ROLE_LABEL[r.role] ?? r.role,
    pin: '••••',
    shift: '—',
    color: colorOf(r.id),
    online: false,
  };
}

export function useStaff() {
  return useQuery({
    queryKey: ['staff'],
    queryFn: async (): Promise<Staff[]> => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, role, created_at')
        .order('created_at');
      if (error) throw error;
      return data.map(mapStaff);
    },
  });
}
