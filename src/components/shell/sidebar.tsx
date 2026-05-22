import { NavLink } from 'react-router-dom';
import { I } from '@/components/icons';
import { fmt } from '@/lib/format';
import type { Route } from '@/app/routes';

interface SidebarProps {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

interface NavEntry {
  id: Route;
  label: string;
  icon: typeof I.dashboard;
  badge?: string;
}

const NAV: NavEntry[] = [
  { id: 'dashboard', label: 'Tổng quan', icon: I.dashboard },
  { id: 'pos', label: 'Bán hàng (POS)', icon: I.pos, badge: 'Mở ca' },
  { id: 'inventory', label: 'Sản phẩm & Kho', icon: I.inventory },
  { id: 'qr', label: 'Mã QR & In tem', icon: I.qr },
  { id: 'purchase', label: 'Nhập hàng', icon: I.purchase },
  { id: 'promo', label: 'Khuyến mãi', icon: I.promo },
  { id: 'analytics', label: 'Phân tích lợi nhuận', icon: I.analytics },
  { id: 'orders', label: 'Lịch sử đơn', icon: I.orders },
  { id: 'customers', label: 'Khách hàng', icon: I.customers },
  { id: 'settings', label: 'Cài đặt', icon: I.settings },
];

export default function Sidebar({ mobileOpen, setMobileOpen }: SidebarProps) {
  return (
    <>
      {mobileOpen && <div className="sidebar-veil" onClick={() => setMobileOpen(false)} />}
      <aside className={`sidebar ${mobileOpen ? 'open' : ''}`}>
        <div className="brand">
          <div className="brand-mark">
            <svg viewBox="0 0 24 24" width="22" height="22">
              <circle cx="12" cy="12" r="10" fill="#FF6B1A" />
              <path d="M12 6v8M8 10h8" stroke="white" strokeWidth="2.4" strokeLinecap="round" />
            </svg>
          </div>
          <div>
            <div className="brand-name">Gandha Shop</div>
            <div className="brand-sub">Cửa hàng gia đình</div>
          </div>
        </div>
        <nav className="nav">
          {NAV.map((n) => {
            const Ic = n.icon;
            return (
              <NavLink
                key={n.id}
                to={`/${n.id}`}
                className={({ isActive }) => `navitem ${isActive ? 'on' : ''}`}
                onClick={() => setMobileOpen(false)}
              >
                <Ic size={18} />
                <span>{n.label}</span>
                {n.badge && <em>{n.badge}</em>}
              </NavLink>
            );
          })}
        </nav>
        <div className="sidebar-foot">
          <div className="shift-card">
            <div className="shift-lbl">Ca hôm nay</div>
            <div className="shift-stat">
              <div>
                <b>{fmt(2986000)}</b>
                <span>₫ doanh thu</span>
              </div>
              <div>
                <b>14</b>
                <span>đơn</span>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
