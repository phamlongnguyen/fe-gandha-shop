import { NavLink } from 'react-router-dom';
import { I } from '@/components/icons';

interface MTabBarProps {
  cartCount?: number;
  onScanReq: () => void;
}

export default function MTabBar({ cartCount = 0, onScanReq }: MTabBarProps) {
  return (
    <div className="m-tabbar">
      <NavLink to="/m" end className={({ isActive }) => `m-tabitem ${isActive ? 'on' : ''}`}>
        <span className="ic"><I.dashboard size={20} /></span>
        <span>Trang chủ</span>
      </NavLink>
      <NavLink to="/m/sell" className={({ isActive }) => `m-tabitem ${isActive ? 'on' : ''}`}>
        <span className="ic" style={{ position: 'relative' }}>
          <I.pos size={20} />
          {cartCount > 0 && (
            <span style={{
              position: 'absolute', top: -3, right: -8, background: '#E11D48', color: 'white',
              fontSize: 9, fontWeight: 700, padding: '1px 4px', borderRadius: 6, minWidth: 14, textAlign: 'center',
            }}>{cartCount}</span>
          )}
        </span>
        <span>Bán hàng</span>
      </NavLink>
      <button className="m-tabitem m-tabitem-scan" onClick={onScanReq} aria-label="Quét QR" type="button">
        <span className="ic"><I.scan size={22} /></span>
      </button>
      <NavLink to="/m/buy" className={({ isActive }) => `m-tabitem ${isActive ? 'on' : ''}`}>
        <span className="ic"><I.purchase size={20} /></span>
        <span>Nhập hàng</span>
      </NavLink>
      <NavLink to="/m/me" className={({ isActive }) => `m-tabitem ${isActive ? 'on' : ''}`}>
        <span className="ic"><I.user size={20} /></span>
        <span>Tôi</span>
      </NavLink>
    </div>
  );
}
