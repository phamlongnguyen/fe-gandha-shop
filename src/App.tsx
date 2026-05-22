import { useEffect, useState } from 'react';
import Sidebar from '@/components/shell/sidebar';
import Topbar from '@/components/shell/topbar';
import {
  TweaksPanel,
  TweakSection,
  TweakSlider,
  TweakToggle,
  TweakRadio,
  TweakSelect,
  useTweaks,
} from '@/components/dev/tweaks-panel';
import Dashboard from '@/features/dashboard/components/dashboard';
import POS from '@/features/pos/components/pos';
import Inventory from '@/features/inventory/components/inventory';
import QRCenter from '@/features/qr/components/qr-center';
import QRScanner from '@/features/qr/components/qr-scanner';
import Purchase from '@/features/purchase/components/purchase';
import Promo from '@/features/promo/components/promo';
import Analytics from '@/features/analytics/components/analytics';
import Orders from '@/features/orders/components/orders';
import Customers from '@/features/customers/components/customers';
import Settings from '@/features/settings/components/settings';
import Login from '@/features/auth/components/login';
import { ROUTE_OPTIONS, type Route } from '@/app/routes';
import { useToasts } from '@/lib/use-toasts';
import { useProfile, useSession, useSignOut } from '@/lib/auth';

type AppTweaks = {
  hue: number;
  dark: boolean;
  density: 'compact' | 'regular' | 'comfy';
  radius: 'sharp' | 'regular' | 'rounded';
  font: 'Inter' | 'Plus Jakarta Sans' | 'Manrope' | 'Nunito';
};

const TWEAK_DEFAULTS: AppTweaks = {
  hue: 28,
  dark: false,
  density: 'compact',
  radius: 'sharp',
  font: 'Plus Jakarta Sans',
};

export default function App() {
  const [t, setTweak] = useTweaks<AppTweaks>(TWEAK_DEFAULTS);
  const [route, setRoute] = useState<Route>('dashboard');
  const [scanOpen, setScanOpen] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);
  const [push, Toaster] = useToasts();
  const { data: session, isLoading: sessionLoading } = useSession();
  const { data: profile, isFetched: profileFetched } = useProfile();
  const signOut = useSignOut();

  useEffect(() => {
    const r = document.documentElement;
    r.style.setProperty('--hue', String(t.hue));
    r.dataset.dark = t.dark ? '1' : '0';
    r.dataset.density = t.density;
    r.dataset.radius = t.radius;
    r.style.setProperty('--font', `'${t.font}', ui-sans-serif, system-ui, sans-serif`);
  }, [t]);

  if (sessionLoading) {
    return (
      <div className="login-wrap">
        <div className="login-card" style={{ textAlign: 'center' }}>Đang tải…</div>
      </div>
    );
  }

  if (!session) {
    return <Login />;
  }

  if (profileFetched && !profile) {
    return (
      <div className="login-wrap">
        <div className="login-card" style={{ textAlign: 'center', gap: 12 }}>
          <div>Tài khoản chưa được kích hoạt.</div>
          <div className="login-hint">Liên hệ chủ shop để được cấp quyền.</div>
          <button type="button" className="btn ghost compact" onClick={() => signOut.mutate()}>
            Đăng xuất
          </button>
        </div>
      </div>
    );
  }

  const screen = (() => {
    switch (route) {
      case 'dashboard':
        return <Dashboard onNav={setRoute} />;
      case 'pos':
        return <POS scanOpen={scanOpen} setScanOpen={setScanOpen} toast={push} />;
      case 'inventory':
        return <Inventory setScanOpen={setScanOpen} toast={push} />;
      case 'qr':
        return <QRCenter toast={push} />;
      case 'purchase':
        return <Purchase toast={push} />;
      case 'promo':
        return <Promo toast={push} />;
      case 'analytics':
        return <Analytics />;
      case 'orders':
        return <Orders />;
      case 'customers':
        return <Customers />;
      case 'settings':
        return <Settings />;
    }
  })();

  return (
    <div className="app">
      <Sidebar active={route} onNav={setRoute} mobileOpen={mobileNav} setMobileOpen={setMobileNav} />
      <div className="main">
        <Topbar
          onScan={() => {
            if (route !== 'pos') setRoute('pos');
            setScanOpen(true);
          }}
          dark={t.dark}
          setDark={(v) => setTweak('dark', v)}
          mobileOpen={mobileNav}
          setMobileOpen={setMobileNav}
          profile={profile ?? null}
          onSignOut={() => signOut.mutate()}
        />
        {screen}
      </div>

      {scanOpen && route !== 'pos' && (
        <QRScanner
          onScan={(p) => push(`Đã tìm thấy: ${p.name} · Tồn ${p.stock}`)}
          onClose={() => setScanOpen(false)}
          mode="inventory"
        />
      )}

      <Toaster />

      <TweaksPanel title="Tweaks">
        <TweakSection label="Theme">
          <TweakSlider label="Hue (cam)" value={t.hue} min={10} max={50} unit="°" onChange={(v) => setTweak('hue', v)} />
          <TweakToggle label="Chế độ tối" value={t.dark} onChange={(v) => setTweak('dark', v)} />
        </TweakSection>
        <TweakSection label="Layout">
          <TweakRadio
            label="Mật độ"
            value={t.density}
            options={[
              { value: 'compact', label: 'Gọn' },
              { value: 'regular', label: 'Vừa' },
              { value: 'comfy', label: 'Thoáng' },
            ]}
            onChange={(v) => setTweak('density', v as AppTweaks['density'])}
          />
          <TweakRadio
            label="Bo tròn"
            value={t.radius}
            options={[
              { value: 'sharp', label: 'Sắc' },
              { value: 'regular', label: 'Vừa' },
              { value: 'rounded', label: 'Bo' },
            ]}
            onChange={(v) => setTweak('radius', v as AppTweaks['radius'])}
          />
        </TweakSection>
        <TweakSection label="Typography">
          <TweakSelect<AppTweaks['font']>
            label="Font UI"
            value={t.font}
            options={['Inter', 'Plus Jakarta Sans', 'Manrope', 'Nunito']}
            onChange={(v) => setTweak('font', v)}
          />
        </TweakSection>
        <TweakSection label="Điều hướng">
          <TweakSelect<Route>
            label="Mở màn hình"
            value={route}
            options={ROUTE_OPTIONS}
            onChange={(v) => setRoute(v)}
          />
        </TweakSection>
      </TweaksPanel>
    </div>
  );
}
