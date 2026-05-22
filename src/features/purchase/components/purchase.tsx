import { useState } from 'react';
import { I } from '@/components/icons';
import PageHead from '@/components/shared/page-head';
import { PRODUCTS } from '@/mocks/products';
import { PURCHASES } from '@/mocks/purchases';
import { fmt } from '@/lib/format';
import type { ToastPush } from '@/lib/use-toasts';

interface PurchaseLine {
  id: string;
  qty: number;
  cost: number;
}

interface PurchaseProps {
  toast: ToastPush;
}

export default function Purchase({ toast }: PurchaseProps) {
  const [items, setItems] = useState<PurchaseLine[]>([
    { id: 'p05', qty: 50, cost: 6500 },
    { id: 'p24', qty: 12, cost: 140000 },
    { id: 'p19', qty: 6, cost: 240000 },
  ]);
  const [supplier, setSupplier] = useState('NPP Thiên Long Q.Tân Bình');

  const total = items.reduce((s, it) => s + it.qty * it.cost, 0);

  const setQty = (i: number, qty: number) =>
    setItems((arr) => arr.map((x, j) => (j === i ? { ...x, qty: Math.max(0, qty) } : x)));
  const setCost = (i: number, cost: number) =>
    setItems((arr) => arr.map((x, j) => (j === i ? { ...x, cost: Math.max(0, cost) } : x)));
  const remove = (i: number) => setItems((arr) => arr.filter((_, j) => j !== i));
  const add = (id: string) => {
    if (items.find((x) => x.id === id)) return;
    const p = PRODUCTS.find((x) => x.id === id);
    if (!p) return;
    setItems((a) => [...a, { id, qty: 10, cost: p.cost }]);
  };

  return (
    <div className="page">
      <PageHead
        title="Nhập hàng"
        subtitle="Tạo phiếu nhập, ghi nhận hóa đơn từ nhà cung cấp. Tồn kho tự cập nhật."
        actions={
          <>
            <button className="btn ghost">
              <I.print size={14} /> In phiếu
            </button>
            <button
              className="btn primary"
              onClick={() => toast('Đã lưu phiếu nhập NH-043 và cập nhật tồn kho')}
            >
              <I.check size={14} /> Hoàn tất nhập kho
            </button>
          </>
        }
      />
      <div className="grid-2-1">
        <div className="card">
          <div className="card-head">
            <div className="card-title">Phiếu nhập NH-043 — nháp</div>
            <span className="muted">{items.length} dòng</span>
          </div>
          <table className="tbl">
            <thead>
              <tr>
                <th>Sản phẩm</th>
                <th className="r">SL</th>
                <th className="r">Giá nhập</th>
                <th className="r">Thành tiền</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((it, i) => {
                const p = PRODUCTS.find((x) => x.id === it.id);
                if (!p) return null;
                return (
                  <tr key={it.id}>
                    <td>
                      <b>{p.name}</b>
                      <span className="td-sub">
                        {p.sku} · tồn {p.stock}
                      </span>
                    </td>
                    <td className="r">
                      <input
                        className="cell-num"
                        type="number"
                        value={it.qty}
                        onChange={(e) => setQty(i, Number(e.target.value) || 0)}
                      />
                    </td>
                    <td className="r">
                      <input
                        className="cell-num wide"
                        type="number"
                        value={it.cost}
                        onChange={(e) => setCost(i, Number(e.target.value) || 0)}
                      />
                    </td>
                    <td className="r mono">
                      <b>{fmt(it.qty * it.cost)}₫</b>
                    </td>
                    <td>
                      <button className="iconbtn sm" onClick={() => remove(i)}>
                        <I.trash size={13} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="add-row">
            <select
              onChange={(e) => {
                add(e.target.value);
                e.target.value = '';
              }}
              value=""
            >
              <option value="">＋ Thêm sản phẩm vào phiếu…</option>
              {PRODUCTS.filter((p) => !p.service && !items.find((it) => it.id === p.id)).map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.sku})
                </option>
              ))}
            </select>
          </div>
          <div className="purchase-total">
            <div className="line">
              <span>Số dòng</span>
              <b>{items.length}</b>
            </div>
            <div className="line">
              <span>Tổng số lượng</span>
              <b>{items.reduce((s, x) => s + x.qty, 0)}</b>
            </div>
            <div className="line total">
              <span>Tổng giá trị nhập</span>
              <b>
                {fmt(total)}<i>₫</i>
              </b>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-head">
            <div className="card-title">Thông tin nhà cung cấp</div>
          </div>
          <div className="form">
            <label>
              Nhà cung cấp
              <select value={supplier} onChange={(e) => setSupplier(e.target.value)}>
                <option>NPP Thiên Long Q.Tân Bình</option>
                <option>Xưởng giày Bình Tân</option>
                <option>Cty Giấy Double A</option>
                <option>Xưởng túi Vạn Phước</option>
                <option>NPP Hồng Hà</option>
                <option>NPP Pentel VN</option>
              </select>
            </label>
            <label>
              Số hóa đơn
              <input defaultValue="HD-04268" />
            </label>
            <label>
              Ngày nhập
              <input defaultValue="26/04/2026" />
            </label>
            <label>
              Phương thức thanh toán
              <select>
                <option>Đã thanh toán</option>
                <option>Công nợ 30 ngày</option>
                <option>Trả góp</option>
              </select>
            </label>
            <label>
              Ghi chú
              <textarea rows={2} placeholder="VD: hàng giao đủ, ký nhận bởi Mẹ" />
            </label>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <div className="card-title">Lịch sử phiếu nhập</div>
        </div>
        <table className="tbl">
          <thead>
            <tr>
              <th>Mã phiếu</th>
              <th>Thời gian</th>
              <th>Nhà cung cấp</th>
              <th>Số dòng</th>
              <th className="r">Tổng</th>
              <th>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {PURCHASES.map((p) => (
              <tr key={p.id}>
                <td>
                  <b>{p.id}</b>
                </td>
                <td>{p.time}</td>
                <td>{p.supplier}</td>
                <td>{p.items}</td>
                <td className="r mono">{fmt(p.total)}₫</td>
                <td>
                  <span className={`pill ${p.status === 'Đã nhập' ? 'ok' : 'low'}`}>{p.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
