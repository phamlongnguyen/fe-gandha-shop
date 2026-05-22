import { useState } from 'react';
import { I } from '@/components/icons';
import PageHead from '@/components/shared/page-head';
import QRCode from './qr-code';
import { CATEGORIES } from '@/mocks/categories';
import { PRODUCTS } from '@/mocks/products';
import { fmt } from '@/lib/format';
import type { ToastPush } from '@/lib/use-toasts';

interface QRCenterProps {
  toast: ToastPush;
}

export default function QRCenter({ toast }: QRCenterProps) {
  const [pick, setPick] = useState<string[]>(() => PRODUCTS.slice(0, 8).map((p) => p.id));

  const isPicked = (id: string) => pick.includes(id);
  const toggle = (id: string) => setPick((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  const items = PRODUCTS.filter((p) => pick.includes(p.id));

  return (
    <div className="page">
      <PageHead
        title="Mã QR & In tem"
        subtitle="Tạo, in và dán mã QR cho sản phẩm. Chọn sản phẩm muốn in rồi In hàng loạt."
        actions={
          <>
            <button className="btn ghost">
              <I.copy size={14} /> Sao chép template
            </button>
            <button
              className="btn primary"
              onClick={() => toast(`Đã gửi ${items.length} tem tới máy in`)}
            >
              <I.print size={14} /> In {items.length} tem
            </button>
          </>
        }
      />

      <div className="grid-2-1">
        <div className="card">
          <div className="card-head">
            <div className="card-title">Chọn sản phẩm cần in QR</div>
            <span className="muted">
              {pick.length}/{PRODUCTS.length} đã chọn
            </span>
          </div>
          <div className="qr-pick-list">
            {PRODUCTS.filter((p) => !p.service).map((p) => (
              <label key={p.id} className={`qr-pick ${isPicked(p.id) ? 'on' : ''}`}>
                <input type="checkbox" checked={isPicked(p.id)} onChange={() => toggle(p.id)} />
                <div className="qp-cat">{CATEGORIES.find((c) => c.id === p.cat)?.icon}</div>
                <div className="qp-meta">
                  <b>{p.name}</b>
                  <span>
                    {p.sku} · {fmt(p.price)}₫
                  </span>
                </div>
                <span className="qp-mark">
                  <I.check size={12} sw={3} />
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-head">
            <div className="card-title">Xem trước</div>
            <span className="muted">Khổ A4 · 24 tem / trang</span>
          </div>
          <div className="sheet">
            {items.slice(0, 12).map((p) => (
              <div key={p.id} className="sheet-cell">
                <div className="sc-brand">GANDHA</div>
                <QRCode value={p.sku} size={64} />
                <div className="sc-sku">{p.sku}</div>
                <div className="sc-name">{p.name}</div>
                <div className="sc-price">
                  {fmt(p.price)}<i>₫</i>
                </div>
              </div>
            ))}
            {Array.from({ length: Math.max(0, 12 - items.length) }).map((_, i) => (
              <div key={`e${i}`} className="sheet-cell empty" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
