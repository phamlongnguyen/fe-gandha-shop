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
  shift: string | null;
  color: string | null;
  avatar_url: string | null;
  is_online: boolean;
  created_at: string;
};

export interface StaffWithExtras extends Staff {
  avatarUrl: string | null;
}

function mapStaff(r: RawProfile): StaffWithExtras {
  return {
    id: r.id,
    name: r.full_name,
    role: ROLE_LABEL[r.role] ?? r.role,
    pin: '••••',
    shift: r.shift ?? '—',
    color: r.color ?? colorOf(r.id),
    online: r.is_online,
    avatarUrl: r.avatar_url,
  };
}

export function useStaff() {
  return useQuery({
    queryKey: ['staff'],
    queryFn: async (): Promise<StaffWithExtras[]> => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, role, shift, color, avatar_url, is_online, created_at')
        .order('created_at');
      if (error) throw error;
      return (data as RawProfile[]).map(mapStaff);
    },
  });
}
