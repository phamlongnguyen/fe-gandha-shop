import type { ReactNode } from 'react';
import { I } from '@/components/icons';
import PageHead from '@/components/shared/page-head';
import { useStaff } from '@/features/settings/hooks/use-staff';

interface DeviceRow {
  name: string;
  status: string;
  icon: ReactNode;
  off?: boolean;
}

const DEVICES: DeviceRow[] = [
  { name: 'Máy in hóa đơn K58', status: 'Đã kết nối', icon: <I.print size={20} /> },
  { name: 'Máy in tem QR Xprinter XP-365B', status: 'Đã kết nối', icon: <I.qr size={20} /> },
  { name: 'Đầu đọc QR USB Honeywell', status: 'Đã kết nối', icon: <I.scan size={20} /> },
  { name: 'Két tiền điện tử', status: 'Chưa kết nối', icon: <I.cash size={20} />, off: true },
];

export default function Settings() {
  const { data: staff = [], isLoading } = useStaff();

  return (
    <div className="page">
      <PageHead title="Cài đặt" subtitle="Thông tin cửa hàng, nhân viên gia đình, máy in & phương thức thanh toán" />
      <div className="grid-2-1">
        <div className="card">
          <div className="card-head">
            <div className="card-title">Nhân viên gia đình</div>
            <button className="btn ghost compact">
              <I.plus size={13} /> Thêm
            </button>
          </div>
          <div className="staff-list">
            {isLoading && <div style={{ padding: 12, color: 'var(--ink-3)' }}>Đang tải…</div>}
            {staff.map((s) => (
              <div key={s.id} className="staff-row">
                <div className="staff-av" style={{ background: s.color }}>
                  {s.name[0]}
                </div>
                <div className="staff-meta">
                  <b>{s.name}</b>
                  <span>
                    {s.role} · Ca {s.shift}
                  </span>
                </div>
                {s.online && <span className="pill ok">Đang online</span>}
                <button className="iconbtn sm">
                  <I.edit size={13} />
                </button>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <div className="card-head">
            <div className="card-title">Cửa hàng</div>
          </div>
          <div className="form">
            <label>
              Tên cửa hàng
              <input defaultValue="Gandha Shop" />
            </label>
            <label>
              Địa chỉ
              <input defaultValue="123 Nguyễn Văn Trỗi, Phú Nhuận, TP.HCM" />
            </label>
            <label>
              Số điện thoại
              <input defaultValue="0908 *** 365" />
            </label>
            <label>
              Tài khoản nhận chuyển khoản
              <input defaultValue="VCB · 9704 0612 3456 7890 · GANDHA SHOP" />
            </label>
            <label>
              Mức tồn cảnh báo mặc định
              <input type="number" defaultValue={10} />
            </label>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <div className="card-title">Thiết bị</div>
        </div>
        <div className="device-grid">
          {DEVICES.map((d, i) => (
            <div key={i} className={`device ${d.off ? 'off' : ''}`}>
              <div className="dev-ic">{d.icon}</div>
              <div className="dev-meta">
                <b>{d.name}</b>
                <span>{d.status}</span>
              </div>
              <button className="btn ghost compact">{d.off ? 'Kết nối' : 'Kiểm tra'}</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
