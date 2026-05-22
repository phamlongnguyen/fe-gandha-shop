import { useEffect, useState } from 'react';
import { I } from '@/components/icons';
import MHeader from './m-header';
import MSheet from './m-sheet';
import MEmpty from './m-empty';
import { useCategories } from '@/features/categories/hooks/use-categories';
import { useProducts } from '@/features/inventory/hooks/use-products';
import { useCreatePurchase, useSuppliers } from '@/features/purchase/hooks/use-purchases';
import { fmt } from '@/lib/format';
import type { Product } from '@/types';
import type { MToastPush } from './m-toaster';

interface MBuyProps {
  toast: MToastPush;
  onScanReq: () => void;
  scannedItem: Product | null;
  clearScannedItem: () => void;
}

interface BuyLine {
  productId: string;
  qty: number;
  cost: number;
}

type PayKind = 'paid' | 'debt_30d' | 'installment';

const PAY_LABEL: Record<PayKind, string> = {
  paid: 'Đã thanh toán',
  debt_30d: 'Công nợ 30 ngày',
  installment: 'Trả góp',
};

interface SuccessState {
  code: string;
  total: number;
  items: number;
  qty: number;
  supplierName: string;
}

export default function MBuy({ toast, onScanReq, scannedItem, clearScannedItem }: MBuyProps) {
  const { data: products = [] } = useProducts();
  const { data: categories = [] } = useCategories();
  const { data: suppliers = [] } = useSuppliers();
  const createPurchase = useCreatePurchase();

  const [items, setItems] = useState<BuyLine[]>([]);
  const [supplierId, setSupplierId] = useState<string | null>(null);
  const [supplierOpen, setSupplierOpen] = useState(false);
  const [pickOpen, setPickOpen] = useState(false);
  const [pickQ, setPickQ] = useState('');
  const [invoice, setInvoice] = useState('');
  const [payment, setPayment] = useState<PayKind>('paid');
  const [note, setNote] = useState('');
  const [success, setSuccess] = useState<SuccessState | null>(null);

  const supplierName = suppliers.find((s) => s.id === supplierId)?.name ?? '— Chưa chọn —';

  const add = (productId: string) => {
    setItems((arr) => {
      if (arr.find((x) => x.productId === productId)) {
        return arr.map((x) => (x.productId === productId ? { ...x, qty: x.qty + 1 } : x));
      }
      const p = products.find((x) => x.id === productId);
      if (!p) return arr;
      return [...arr, { productId, qty: 10, cost: p.cost }];
    });
    const p = products.find((x) => x.id === productId);
    if (p) toast(`Thêm: ${p.name}`);
  };

  useEffect(() => {
    if (scannedItem) {
      add(scannedItem.id);
      clearScannedItem();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scannedItem]);

  const setQty = (i: number, qty: number) => setItems((a) => a.map((x, j) => (j === i ? { ...x, qty: Math.max(0, qty) } : x)));
  const setCost = (i: number, cost: number) => setItems((a) => a.map((x, j) => (j === i ? { ...x, cost: Math.max(0, cost) } : x)));
  const remove = (i: number) => setItems((a) => a.filter((_, j) => j !== i));

  const total = items.reduce((s, it) => s + it.qty * it.cost, 0);
  const totalQty = items.reduce((s, it) => s + it.qty, 0);

  const submit = () => {
    if (items.length === 0) { toast('Phiếu cần ít nhất 1 dòng'); return; }
    createPurchase.mutate(
      {
        supplierId,
        invoiceNumber: invoice,
        paymentMethod: payment,
        note,
        lines: items.map((it) => ({ productId: it.productId, quantity: it.qty, unitCost: it.cost })),
      },
      {
        onSuccess: (po) => {
          setSuccess({
            code: po.code, total, items: items.length, qty: totalQty,
            supplierName,
          });
        },
        onError: (e) => toast(e instanceof Error ? e.message : 'Lỗi khi lưu phiếu'),
      },
    );
  };

  const reset = () => {
    setSuccess(null);
    setItems([]);
    setInvoice('');
    setNote('');
    toast('Đã lưu phiếu nhập · Tồn kho cập nhật khi nhận hàng');
  };

  const filteredPicks = products.filter(
    (p) => !p.service &&
      (pickQ === '' || p.name.toLowerCase().includes(pickQ.toLowerCase()) || p.sku.toLowerCase().includes(pickQ.toLowerCase())),
  );

  return (
    <>
      <MHeader
        title="Nhập hàng"
        sub="Phiếu nháp"
        accent
        right={<button className="m-header-btn" onClick={onScanReq}><I.scan size={18} /></button>}
      />

      <div className={`m-body${items.length === 0 ? ' has-fab' : ''}`}>
        <div className="m-section">
          <div className="m-section-title">Nhà cung cấp</div>
          <button className="m-card m-row" onClick={() => setSupplierOpen(true)} style={{ width: '100%' }}>
            <div className="m-row-ic" style={{ background: 'var(--surface-2)', color: 'var(--ink-2)' }}>
              <I.box size={18} />
            </div>
            <div>
              <div className="m-row-title">{supplierName}</div>
              <div className="m-row-sub">{invoice ? `HĐ ${invoice}` : 'Chưa có HĐ'} · {PAY_LABEL[payment]}</div>
            </div>
            <div className="m-row-r"><I.edit size={14} /></div>
          </button>
        </div>

        <div className="m-section">
          <div className="m-section-title">
            <span>Sản phẩm nhập</span>
            <em>{items.length} dòng · {totalQty} mặt hàng</em>
          </div>
          {items.length === 0 && <MEmpty icon={<I.box size={26} />} title="Phiếu trống" hint="Quét QR hoặc bấm + để thêm sản phẩm" />}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {items.map((it, i) => {
              const p = products.find((x) => x.id === it.productId);
              if (!p) return null;
              const cat = categories.find((c) => c.id === p.cat);
              return (
                <div key={it.productId} className="m-buy-row">
                  <div className="m-buy-row-head">
                    <div style={{ width: 38, height: 38, borderRadius: 9, background: 'var(--accent-soft)', color: 'var(--accent-deep)', display: 'grid', placeItems: 'center', fontSize: 18 }}>
                      {cat?.icon ?? '•'}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div className="m-buy-row-name">{p.name}</div>
                      <div className="m-buy-row-sku">{p.sku} · tồn hiện tại {p.stock} {p.unit}</div>
                    </div>
                    <button onClick={() => remove(i)} style={{ width: 30, height: 30, border: 0, background: 'transparent', color: 'var(--ink-3)', borderRadius: 8 }}>
                      <I.trash size={15} />
                    </button>
                  </div>
                  <div className="m-buy-row-num">
                    <label>
                      <span>Số lượng ({p.unit})</span>
                      <input type="number" inputMode="numeric" value={it.qty} onChange={(e) => setQty(i, Number(e.target.value) || 0)} />
                    </label>
                    <label>
                      <span>Giá nhập / {p.unit}</span>
                      <input type="number" inputMode="numeric" value={it.cost} onChange={(e) => setCost(i, Number(e.target.value) || 0)} />
                    </label>
                  </div>
                  <div className="m-buy-row-line">
                    <span>
                      Sau nhập: <b style={{ color: 'var(--ink-1)', fontSize: 13 }}>{p.stock + it.qty}</b>{' '}
                      <span className="stock-delta">+{it.qty}</span>
                    </span>
                    <b>{fmt(it.qty * it.cost)}₫</b>
                  </div>
                </div>
              );
            })}
          </div>

          <button className="m-btn ghost" style={{ marginTop: 12 }} onClick={() => setPickOpen(true)}>
            <I.plus size={16} /> Thêm thủ công
          </button>
        </div>

        {items.length > 0 && (
          <div className="m-section">
            <div className="m-section-title">Tổng cộng</div>
            <div className="m-card" style={{ padding: '14px 16px' }}>
              <div className="m-tl"><span>Số dòng</span><b>{items.length}</b></div>
              <div className="m-tl" style={{ marginTop: 4 }}><span>Tổng số lượng nhập</span><b>{totalQty}</b></div>
              <div className="m-tl total"><span>Tổng giá trị</span><b>{fmt(total)}<i>₫</i></b></div>
            </div>
          </div>
        )}

        {items.length > 0 && (
          <div style={{ padding: '8px 16px 12px' }}>
            <button className="m-btn" onClick={submit} disabled={createPurchase.isPending}>
              <I.check size={16} /> {createPurchase.isPending ? 'Đang lưu…' : `Lưu phiếu nhập · ${fmt(total)}₫`}
            </button>
            <button className="m-btn ghost sm" style={{ marginTop: 8 }}>
              <I.print size={14} /> In phiếu nhập
            </button>
          </div>
        )}
      </div>

      {items.length === 0 && (
        <button className="m-fab" onClick={onScanReq}>
          <I.scan size={22} />
        </button>
      )}

      {supplierOpen && (
        <MSheet onClose={() => setSupplierOpen(false)} title="Thông tin nhà cung cấp">
          <div className="m-sheet-body">
            <div className="m-field">
              <label>Nhà cung cấp</label>
              <select value={supplierId ?? ''} onChange={(e) => setSupplierId(e.target.value || null)}>
                <option value="">— Chọn —</option>
                {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div className="m-field-row">
              <div className="m-field">
                <label>Số hóa đơn</label>
                <input value={invoice} onChange={(e) => setInvoice(e.target.value)} placeholder="HD-04268" />
              </div>
              <div className="m-field">
                <label>Ngày nhập</label>
                <input defaultValue={new Date().toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })} />
              </div>
            </div>
            <div className="m-field">
              <label>Hình thức thanh toán</label>
              <select value={payment} onChange={(e) => setPayment(e.target.value as PayKind)}>
                <option value="paid">Đã thanh toán</option>
                <option value="debt_30d">Công nợ 30 ngày</option>
                <option value="installment">Trả góp</option>
              </select>
            </div>
            <div className="m-field">
              <label>Ghi chú</label>
              <textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder="VD: hàng giao đủ, ký nhận bởi Mẹ" />
            </div>
          </div>
          <div className="m-sheet-foot">
            <button className="m-btn" onClick={() => setSupplierOpen(false)}>Xong</button>
          </div>
        </MSheet>
      )}

      {pickOpen && (
        <MSheet onClose={() => setPickOpen(false)} title="Chọn sản phẩm" sub="Hoặc quét QR để nhanh hơn">
          <div style={{ padding: '0 18px 8px' }}>
            <div className="m-search" style={{ margin: '6px 0' }}>
              <I.search size={16} />
              <input value={pickQ} onChange={(e) => setPickQ(e.target.value)} placeholder="Tên hoặc SKU…" />
              {pickQ && <button onClick={() => setPickQ('')}><I.x size={14} /></button>}
            </div>
          </div>
          <div className="m-sheet-body" style={{ padding: '0 18px 12px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {filteredPicks.map((p) => {
                const cat = categories.find((c) => c.id === p.cat);
                const has = items.find((x) => x.productId === p.id);
                return (
                  <button key={p.id} className="m-prod" onClick={() => { add(p.id); setPickOpen(false); }} style={{ opacity: has ? 0.55 : 1 }}>
                    <div className="m-prod-thumb">{cat?.icon ?? '•'}</div>
                    <div style={{ minWidth: 0 }}>
                      <div className="m-prod-name">{p.name}</div>
                      <div className="m-prod-meta">
                        <span className="mono">{p.sku.slice(-7)}</span>
                        <span className="dot" />
                        <span>tồn {p.stock} {p.unit}</span>
                      </div>
                    </div>
                    <div className="m-prod-right">
                      <div className="m-prod-price" style={{ fontSize: 12, color: 'var(--ink-3)', fontWeight: 500 }}>Giá nhập</div>
                      <div className="m-prod-price">{fmt(p.cost)}<i>₫</i></div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </MSheet>
      )}

      {success && (
        <div className="m-success">
          <div className="m-success-card">
            <div className="m-success-ring"><I.check size={32} sw={3} /></div>
            <h2>Đã lưu phiếu nhập</h2>
            <p>{success.code} · {success.items} sản phẩm · {success.qty} mặt hàng</p>
            <div className="m-success-meta">
              <span>Tổng giá trị</span><b>{fmt(success.total)}₫</b>
            </div>
            <p style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 4 }}>
              ✓ Trạng thái: chờ nhận hàng<br />✓ NCC: {success.supplierName}
            </p>
            <div className="m-success-actions">
              <button className="m-btn ghost sm"><I.print size={14} /> In</button>
              <button className="m-btn sm" onClick={reset}>Phiếu mới</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
