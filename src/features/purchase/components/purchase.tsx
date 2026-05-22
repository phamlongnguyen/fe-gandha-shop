import { useRef, useState } from 'react';
import { I } from '@/components/icons';
import PageHead from '@/components/shared/page-head';
import Pagination from '@/components/shared/pagination';
import { useProducts } from '@/features/inventory/hooks/use-products';
import {
  useCreatePurchase,
  usePurchases,
  useReceivePurchase,
  useSuppliers,
} from '@/features/purchase/hooks/use-purchases';
import { fmt } from '@/lib/format';
import type { ToastPush } from '@/lib/use-toasts';

const PURCHASES_PAGE_SIZE = 20;

interface PurchaseLine {
  productId: string;
  qty: number;
  cost: number;
}

const PAY_OPTIONS = [
  { value: 'paid' as const, label: 'Đã thanh toán' },
  { value: 'debt_30d' as const, label: 'Công nợ 30 ngày' },
  { value: 'installment' as const, label: 'Trả góp' },
];

interface PurchaseProps {
  toast: ToastPush;
}

export default function Purchase({ toast }: PurchaseProps) {
  const [purchasePage, setPurchasePage] = useState(1);
  const { data: products = [] } = useProducts();
  const { data: suppliers = [] } = useSuppliers();
  const { data: purchasesResult, isLoading } = usePurchases({ page: purchasePage, pageSize: PURCHASES_PAGE_SIZE });
  const purchases = purchasesResult?.rows ?? [];
  const purchasesTotal = purchasesResult?.total ?? 0;
  const createPurchase = useCreatePurchase();
  const receivePurchase = useReceivePurchase();

  const [lines, setLines] = useState<PurchaseLine[]>([]);
  const [supplierId, setSupplierId] = useState<string>('');
  const [invoice, setInvoice] = useState('');
  const [payMethod, setPayMethod] = useState<'paid' | 'debt_30d' | 'installment'>('paid');
  const [note, setNote] = useState('');
  const invoiceRef = useRef<HTMLInputElement>(null);

  const total = lines.reduce((s, l) => s + l.qty * l.cost, 0);
  const printable = products.filter((p) => !p.service);

  const setQty = (i: number, qty: number) =>
    setLines((arr) => arr.map((x, j) => (j === i ? { ...x, qty: Math.max(0, qty) } : x)));
  const setCost = (i: number, cost: number) =>
    setLines((arr) => arr.map((x, j) => (j === i ? { ...x, cost: Math.max(0, cost) } : x)));
  const remove = (i: number) => setLines((arr) => arr.filter((_, j) => j !== i));
  const addLine = (productId: string) => {
    if (lines.find((x) => x.productId === productId)) return;
    const p = products.find((x) => x.id === productId);
    if (!p) return;
    setLines((a) => [...a, { productId, qty: 10, cost: p.cost }]);
  };

  const handleSubmit = () => {
    if (lines.length === 0) { toast('Phiếu nhập cần ít nhất 1 dòng sản phẩm', 'warn'); return; }
    createPurchase.mutate(
      {
        supplierId: supplierId || null,
        invoiceNumber: invoice,
        paymentMethod: payMethod,
        note,
        lines: lines.map((l) => ({ productId: l.productId, quantity: l.qty, unitCost: l.cost })),
      },
      {
        onSuccess: (po) => {
          toast(`Đã lưu phiếu ${po.code} · ${fmt(total)}₫`);
          setLines([]);
          setSupplierId('');
          setInvoice('');
          setNote('');
        },
        onError: (e) => toast(e instanceof Error ? e.message : 'Lỗi khi lưu phiếu', 'warn'),
      },
    );
  };

  const handleReceive = (rowId: string, code: string) => {
    receivePurchase.mutate(
      { purchaseId: rowId },
      {
        onSuccess: () => toast(`Đã nhận hàng phiếu ${code} · tồn kho đã cập nhật`),
        onError: (e) => toast(e instanceof Error ? e.message : 'Lỗi khi nhận hàng', 'warn'),
      },
    );
  };

  return (
    <div className="page">
      <PageHead
        title="Nhập hàng"
        subtitle="Tạo phiếu nhập, ghi nhận hóa đơn từ nhà cung cấp. Tồn kho tự cập nhật."
        actions={
          <>
            <button className="btn ghost"><I.print size={14} /> In phiếu</button>
            <button className="btn primary" onClick={handleSubmit} disabled={createPurchase.isPending}>
              <I.check size={14} /> {createPurchase.isPending ? 'Đang lưu…' : 'Hoàn tất nhập kho'}
            </button>
          </>
        }
      />

      <div className="grid-2-1">
        <div className="card">
          <div className="card-head">
            <div className="card-title">Phiếu nhập — nháp</div>
            <span className="muted">{lines.length} dòng</span>
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
              {lines.map((line, i) => {
                const p = products.find((x) => x.id === line.productId);
                if (!p) return null;
                return (
                  <tr key={line.productId}>
                    <td>
                      <b>{p.name}</b>
                      <span className="td-sub">{p.sku} · tồn {p.stock}</span>
                    </td>
                    <td className="r">
                      <input className="cell-num" type="number" value={line.qty} onChange={(e) => setQty(i, Number(e.target.value) || 0)} />
                    </td>
                    <td className="r">
                      <input className="cell-num wide" type="number" value={line.cost} onChange={(e) => setCost(i, Number(e.target.value) || 0)} />
                    </td>
                    <td className="r mono"><b>{fmt(line.qty * line.cost)}₫</b></td>
                    <td><button className="iconbtn sm" onClick={() => remove(i)}><I.trash size={13} /></button></td>
                  </tr>
                );
              })}
              {lines.length === 0 && (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: 24, color: 'var(--ink-3)' }}>Chọn sản phẩm bên dưới để thêm vào phiếu</td></tr>
              )}
            </tbody>
          </table>
          <div className="add-row">
            <select onChange={(e) => { addLine(e.target.value); e.target.value = ''; }} value="">
              <option value="">＋ Thêm sản phẩm vào phiếu…</option>
              {printable.filter((p) => !lines.find((l) => l.productId === p.id)).map((p) => (
                <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
              ))}
            </select>
          </div>
          <div className="purchase-total">
            <div className="line"><span>Số dòng</span><b>{lines.length}</b></div>
            <div className="line"><span>Tổng số lượng</span><b>{lines.reduce((s, x) => s + x.qty, 0)}</b></div>
            <div className="line total"><span>Tổng giá trị nhập</span><b>{fmt(total)}<i>₫</i></b></div>
          </div>
        </div>

        <div className="card">
          <div className="card-head"><div className="card-title">Thông tin nhà cung cấp</div></div>
          <div className="form">
            <label>
              Nhà cung cấp
              <select value={supplierId} onChange={(e) => setSupplierId(e.target.value)}>
                <option value="">— Chọn hoặc nhập tên mới —</option>
                {suppliers.map((s) => (<option key={s.id} value={s.id}>{s.name}</option>))}
              </select>
            </label>
            <label>
              Số hóa đơn
              <input ref={invoiceRef} value={invoice} onChange={(e) => setInvoice(e.target.value)} placeholder="HD-04268" />
            </label>
            <label>
              Phương thức thanh toán
              <select value={payMethod} onChange={(e) => setPayMethod(e.target.value as typeof payMethod)}>
                {PAY_OPTIONS.map((o) => (<option key={o.value} value={o.value}>{o.label}</option>))}
              </select>
            </label>
            <label>
              Ghi chú
              <textarea rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder="VD: hàng giao đủ, ký nhận bởi Mẹ" />
            </label>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <div className="card-title">Lịch sử phiếu nhập</div>
          <span className="muted">{purchasesTotal} phiếu</span>
        </div>
        <table className="tbl">
          <thead>
            <tr>
              <th>Mã phiếu</th><th>Thời gian</th><th>Nhà cung cấp</th>
              <th>Số dòng</th><th className="r">Tổng</th><th>Trạng thái</th><th></th>
            </tr>
          </thead>
          <tbody>
            {isLoading && <tr><td colSpan={7} style={{ textAlign: 'center', padding: 24, color: 'var(--ink-3)' }}>Đang tải…</td></tr>}
            {purchases.map((p) => (
              <tr key={p.rowId}>
                <td><b>{p.id}</b></td>
                <td>{p.time}</td>
                <td>{p.supplier}</td>
                <td>{p.items}</td>
                <td className="r mono">{fmt(p.total)}₫</td>
                <td><span className={`pill ${p.status === 'Đã nhập' ? 'ok' : 'low'}`}>{p.status}</span></td>
                <td>
                  {p.status === 'Đang giao' && (
                    <button
                      className="btn ghost compact"
                      onClick={() => handleReceive(p.rowId, p.id)}
                      disabled={receivePurchase.isPending}
                    >
                      <I.check size={13} /> Nhận hàng
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Pagination page={purchasePage} pageSize={PURCHASES_PAGE_SIZE} total={purchasesTotal} onChange={setPurchasePage} />
      </div>
    </div>
  );
}
