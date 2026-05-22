import { useEffect, useState } from 'react';
import {
  Navigate,
  Outlet,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useOutletContext,
} from 'react-router-dom';
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
import MLayout from '@/features/mobile/components/m-layout';
import { ROUTE_OPTIONS, type Route as AppRoute } from '@/app/routes';
import { useToasts, type ToastPush } from '@/lib/use-toasts';
import { useProfile, useSession, useSignOut } from '@/lib/auth';
import { useIsMobile, preferDesktop } from '@/lib/use-viewport';

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

export interface LayoutContext {
  scanOpen: boolean;
  setScanOpen: (open: boolean) => void;
  toast: ToastPush;
}

export function useLayoutContext(): LayoutContext {
  return useOutletContext<LayoutContext>();
}

export default function App() {
  const [t, setTweak] = useTweaks<AppTweaks>(TWEAK_DEFAULTS);
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

  return (
    <>
      <MobileRedirect />
      <Routes>
        <Route
          path="/m/*"
          element={
            <MLayout
              dark={t.dark}
              setDark={(v) => setTweak('dark', v)}
              hue={t.hue}
              setHue={(v) => setTweak('hue', v)}
            />
          }
        />
        <Route element={<Layout tweaks={t} setTweak={setTweak} />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/pos" element={<POSWrapper />} />
          <Route path="/inventory" element={<InventoryWrapper />} />
          <Route path="/qr" element={<QRWrapper />} />
          <Route path="/purchase" element={<PurchaseWrapper />} />
          <Route path="/promo" element={<PromoWrapper />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/settings" element={<SettingsWrapper />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </>
  );
}

function MobileRedirect() {
  const isMobile = useIsMobile();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isMobile) return;
    if (preferDesktop()) return;
    if (location.pathname.startsWith('/m')) return;
    navigate('/m', { replace: true });
  }, [isMobile, location.pathname, navigate]);

  return null;
}

function POSWrapper() {
  const ctx = useLayoutContext();
  return <POS scanOpen={ctx.scanOpen} setScanOpen={ctx.setScanOpen} toast={ctx.toast} />;
}

function InventoryWrapper() {
  const ctx = useLayoutContext();
  return <Inventory setScanOpen={ctx.setScanOpen} toast={ctx.toast} />;
}

function QRWrapper() {
  const ctx = useLayoutContext();
  return <QRCenter toast={ctx.toast} />;
}

function PurchaseWrapper() {
  const ctx = useLayoutContext();
  return <Purchase toast={ctx.toast} />;
}

function PromoWrapper() {
  const ctx = useLayoutContext();
  return <Promo toast={ctx.toast} />;
}

function SettingsWrapper() {
  const ctx = useLayoutContext();
  return <Settings toast={ctx.toast} />;
}

interface LayoutProps {
  tweaks: AppTweaks;
  setTweak: <K extends keyof AppTweaks>(k: K, v: AppTweaks[K]) => void;
}

function Layout({ tweaks: t, setTweak }: LayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [scanOpen, setScanOpen] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);
  const [push, Toaster] = useToasts();
  const { data: profile } = useProfile();
  const signOut = useSignOut();

  const currentRoute = (location.pathname.replace(/^\/+/, '').split('/')[0] || 'dashboard') as AppRoute;

  const ctx: LayoutContext = { scanOpen, setScanOpen, toast: push };

  return (
    <div className="app">
      <Sidebar mobileOpen={mobileNav} setMobileOpen={setMobileNav} />
      <div className="main">
        <Topbar
          onScan={() => {
            if (currentRoute !== 'pos') navigate('/pos');
            setScanOpen(true);
          }}
          dark={t.dark}
          setDark={(v) => setTweak('dark', v)}
          mobileOpen={mobileNav}
          setMobileOpen={setMobileNav}
          profile={profile ?? null}
          onSignOut={() => signOut.mutate()}
        />
        <Outlet context={ctx} />
      </div>

      {scanOpen && currentRoute !== 'pos' && (
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
          <TweakSelect<AppRoute>
            label="Mở màn hình"
            value={currentRoute}
            options={ROUTE_OPTIONS}
            onChange={(v) => navigate(`/${v}`)}
          />
        </TweakSection>
      </TweaksPanel>
    </div>
  );
}
