import { I } from '@/components/icons';
import type { Profile } from '@/lib/auth';

interface TopbarProps {
  onScan: () => void;
  dark: boolean;
  setDark: (v: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  profile: Profile | null;
  onSignOut: () => void;
}

const ROLE_LABEL: Record<string, string> = {
  owner: 'Chủ shop',
  staff: 'Nhân viên',
};

export default function Topbar({
  onScan,
  dark,
  setDark,
  mobileOpen,
  setMobileOpen,
  profile,
  onSignOut,
}: TopbarProps) {
  const dateStr = new Date().toLocaleDateString('vi-VN', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  const name = profile?.full_name ?? '—';
  const role = profile ? ROLE_LABEL[profile.role] ?? profile.role : '';
  const initial = name.charAt(0).toUpperCase();

  return (
    <header className="topbar">
      <button className="iconbtn only-mobile" onClick={() => setMobileOpen(!mobileOpen)}>
        <I.menu />
      </button>
      <div className="topbar-search">
        <I.search size={16} />
        <input placeholder="Tìm sản phẩm, SKU, đơn hàng, khách… (⌘K)" />
        <kbd>⌘K</kbd>
      </div>
      <div className="topbar-spacer" />
      <div className="topbar-date">{dateStr}</div>
      <button className="btn ghost compact" onClick={onScan}>
        <I.scan size={16} />
        Quét QR
      </button>
      <button className="iconbtn" onClick={() => setDark(!dark)} title="Sáng / tối">
        {dark ? <I.sun /> : <I.moon />}
      </button>
      <button className="iconbtn">
        <I.bell />
        <span className="dot" />
      </button>
      <div className="me">
        <div className="avatar" style={{ background: '#FF6B1A' }}>
          {initial}
        </div>
        <div className="me-meta">
          <div className="me-name">{name}</div>
          <div className="me-role">{role}</div>
        </div>
        <button className="iconbtn" title="Đăng xuất" onClick={onSignOut}>
          <I.x />
        </button>
      </div>
    </header>
  );
}
