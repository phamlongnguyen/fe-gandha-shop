import { I } from '@/components/icons';
import MHeader from './m-header';
import { useProfile, useSignOut } from '@/lib/auth';
import { useCustomers } from '@/features/customers/hooks/use-customers';
import { useActiveShopPromos } from '@/features/promo/hooks/use-promos';

interface MMeProps {
  dark: boolean;
  setDark: (v: boolean) => void;
  hue: number;
  setHue: (v: number) => void;
}

const ROLE_LABEL: Record<string, string> = {
  owner: 'Chủ shop',
  staff: 'Nhân viên',
};

export default function MMe({ dark, setDark, hue, setHue }: MMeProps) {
  const { data: profile } = useProfile();
  const signOut = useSignOut();
  const { data: customersResult } = useCustomers({ pageSize: 1 });
  const { data: activePromos = [] } = useActiveShopPromos();

  const name = profile?.full_name ?? '—';
  const role = profile ? ROLE_LABEL[profile.role] ?? profile.role : '';
  const color = profile?.color ?? '#FF6B1A';

  return (
    <>
      <MHeader title="Tôi" sub={profile?.shift ? `Ca làm: ${profile.shift}` : role} />
      <div className="m-body">
        <div className="m-section">
          <div className="m-card" style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 52, height: 52, borderRadius: '50%',
              background: color, color: 'white',
              display: 'grid', placeItems: 'center', fontSize: 22, fontWeight: 700,
            }}>{name.charAt(0).toUpperCase()}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 17, fontWeight: 700 }}>{name}</div>
              <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 2 }}>
                {role}{profile?.shift && ` · đang trực ca ${profile.shift}`}
              </div>
            </div>
            {profile?.is_online && <span className="stock-pill ok">● Online</span>}
          </div>
        </div>

        <div className="m-section">
          <div className="m-section-title">Cài đặt nhanh</div>
          <div className="m-card">
            <div className="m-row">
              <div className="m-row-ic" style={{ background: 'var(--surface-2)', color: 'var(--ink-2)' }}>
                {dark ? <I.moon size={16} /> : <I.sun size={16} />}
              </div>
              <div><div className="m-row-title">Chế độ tối</div></div>
              <button className="twk-toggle" data-on={dark ? '1' : '0'} onClick={() => setDark(!dark)}><i /></button>
            </div>
            <div className="m-row" style={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                <div className="m-row-title">Sắc cam Gandha</div>
                <span className="mono" style={{ fontSize: 12, color: 'var(--ink-3)' }}>{hue}°</span>
              </div>
              <input
                type="range"
                min={10}
                max={50}
                value={hue}
                onChange={(e) => setHue(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--accent)' }}
              />
            </div>
          </div>
        </div>

        <div className="m-section">
          <div className="m-section-title">Khác</div>
          <div className="m-card">
            <button className="m-row">
              <div className="m-row-ic"><I.customers size={16} /></div>
              <div>
                <div className="m-row-title">Khách hàng</div>
                <div className="m-row-sub">{customersResult?.total ?? 0} khách</div>
              </div>
              <div className="m-row-r"><I.arrowRight size={14} /></div>
            </button>
            <button className="m-row">
              <div className="m-row-ic"><I.promo size={16} /></div>
              <div>
                <div className="m-row-title">Khuyến mãi</div>
                <div className="m-row-sub">{activePromos.length} đang chạy</div>
              </div>
              <div className="m-row-r"><I.arrowRight size={14} /></div>
            </button>
            <button className="m-row">
              <div className="m-row-ic"><I.analytics size={16} /></div>
              <div>
                <div className="m-row-title">Báo cáo</div>
                <div className="m-row-sub">14 ngày qua</div>
              </div>
              <div className="m-row-r"><I.arrowRight size={14} /></div>
            </button>
            <button className="m-row">
              <div className="m-row-ic"><I.settings size={16} /></div>
              <div>
                <div className="m-row-title">Cài đặt</div>
                <div className="m-row-sub">In, máy quét, nhân viên</div>
              </div>
              <div className="m-row-r"><I.arrowRight size={14} /></div>
            </button>
          </div>
        </div>

        <div className="m-section">
          <button className="m-btn ghost" onClick={() => signOut.mutate()}>
            Đăng xuất
          </button>
        </div>
      </div>
    </>
  );
}
