import { useState } from 'react';
import { I } from '@/components/icons';
import PageHead from '@/components/shared/page-head';
import { useStaff } from '@/features/settings/hooks/use-staff';
import { useDevices, useStoreConfig, useUpdateStoreConfig } from '@/features/settings/hooks/use-store-config';
import type { ToastPush } from '@/lib/use-toasts';

const DEVICE_ICON: Record<string, string> = {
  receipt_printer: '🖨',
  label_printer: '🏷',
  qr_scanner: '📷',
  cash_drawer: '💵',
};

interface SettingsProps {
  toast?: ToastPush;
}

export default function Settings({ toast }: SettingsProps) {
  const { data: staff = [], isLoading: staffLoading } = useStaff();
  const { data: config } = useStoreConfig();
  const { data: devices = [] } = useDevices();
  const updateConfig = useUpdateStoreConfig();

  const [storeName, setStoreName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [defaultMinStock, setDefaultMinStock] = useState(10);
  const [configLoaded, setConfigLoaded] = useState(false);

  if (config && !configLoaded) {
    setStoreName(config.store_name);
    setAddress(config.address ?? '');
    setPhone(config.phone ?? '');
    setBankAccount(config.bank_account ?? '');
    setDefaultMinStock(config.default_min_stock);
    setConfigLoaded(true);
  }

  const saveConfig = () => {
    updateConfig.mutate(
      { store_name: storeName, address: address || null, phone: phone || null, bank_account: bankAccount || null, default_min_stock: defaultMinStock },
      {
        onSuccess: () => toast?.('Đã lưu thông tin cửa hàng'),
        onError: (e) => toast?.(e instanceof Error ? e.message : 'Lỗi khi lưu', 'warn'),
      },
    );
  };

  return (
    <div className="page">
      <PageHead title="Cài đặt" subtitle="Thông tin cửa hàng, nhân viên gia đình, máy in & phương thức thanh toán" />

      <div className="grid-2-1">
        <div className="card">
          <div className="card-head">
            <div className="card-title">Nhân viên gia đình</div>
            <button className="btn ghost compact"><I.plus size={13} /> Thêm</button>
          </div>
          <div className="staff-list">
            {staffLoading && <div style={{ padding: 12, color: 'var(--ink-3)' }}>Đang tải…</div>}
            {staff.map((s) => (
              <div key={s.id} className="staff-row">
                <div className="staff-av" style={{ background: s.color }}>
                  {s.avatarUrl
                    ? <img src={s.avatarUrl} alt={s.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                    : s.name[0]}
                </div>
                <div className="staff-meta">
                  <b>{s.name}</b>
                  <span>{s.role} · Ca {s.shift}</span>
                </div>
                {s.online && <span className="pill ok">Đang online</span>}
                <button className="iconbtn sm"><I.edit size={13} /></button>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-head">
            <div className="card-title">Cửa hàng</div>
            <button className="btn ghost compact" onClick={saveConfig} disabled={updateConfig.isPending}>
              {updateConfig.isPending ? 'Đang lưu…' : 'Lưu'}
            </button>
          </div>
          <div className="form">
            <label>Tên cửa hàng<input value={storeName} onChange={(e) => setStoreName(e.target.value)} /></label>
            <label>Địa chỉ<input value={address} onChange={(e) => setAddress(e.target.value)} /></label>
            <label>Số điện thoại<input value={phone} onChange={(e) => setPhone(e.target.value)} /></label>
            <label>Tài khoản nhận chuyển khoản<input value={bankAccount} onChange={(e) => setBankAccount(e.target.value)} /></label>
            <label>
              Mức tồn cảnh báo mặc định
              <input type="number" value={defaultMinStock} onChange={(e) => setDefaultMinStock(Number(e.target.value) || 10)} />
            </label>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-head"><div className="card-title">Thiết bị</div></div>
        <div className="device-grid">
          {devices.length === 0 && (
            <div style={{ padding: 16, color: 'var(--ink-3)', gridColumn: '1/-1' }}>Chưa có thiết bị nào. Thêm qua Studio hoặc API.</div>
          )}
          {devices.map((d) => (
            <div key={d.id} className={`device ${d.status === 'disconnected' ? 'off' : ''}`}>
              <div className="dev-ic">{DEVICE_ICON[d.type] ?? '⚙'}</div>
              <div className="dev-meta">
                <b>{d.name}</b>
                <span>{d.status === 'connected' ? 'Đã kết nối' : d.status === 'error' ? 'Lỗi' : 'Chưa kết nối'}</span>
              </div>
              <button className="btn ghost compact">{d.status === 'connected' ? 'Kiểm tra' : 'Kết nối'}</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
