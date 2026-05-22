import { useEffect, useRef, useState } from 'react';
import type { KeyboardEvent as ReactKeyboardEvent, ReactNode } from 'react';
import { I } from '@/components/icons';
import EmptyState from '@/components/shared/empty-state';
import QRScanner from '@/features/qr/components/qr-scanner';
import PaymentQR from '@/features/qr/components/payment-qr';
import { useCategories } from '@/features/categories/hooks/use-categories';
import { useProducts } from '@/features/inventory/hooks/use-products';
import { useCustomers } from '@/features/customers/hooks/use-customers';
import { useCreateOrder, type PaymentMethod } from '@/features/pos/hooks/use-create-order';
import { PROMOS } from '@/mocks/promos';
import { applyProductPromo } from '@/lib/promo';
import { fmt } from '@/lib/format';
import { shortOrderId } from '@/features/orders/hooks/use-orders';
import type { CartItem, Product, ShopPromo } from '@/types';
import type { ToastPush } from '@/lib/use-toasts';

type PayMethod = 'cash' | 'qr' | 'card';

const PAY_TO_BE: Record<PayMethod, PaymentMethod> = {
  cash: 'cash',
  qr: 'transfer',
  card: 'card',
};

interface SuccessState {
  id: string;
  total: number;
  items: number;
  method: PayMethod;
  received: number;
  change: number;
}

interface POSProps {
  scanOpen: boolean;
  setScanOpen: (open: boolean) => void;
  toast: ToastPush;
}

export default function POS({ scanOpen, setScanOpen, toast }: POSProps) {
  const [cat, setCat] = useState<'all' | string>('all');
  const [q, setQ] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [discount, setDiscount] = useState(0);
  const [promo, setPromo] = useState<ShopPromo | null>(null);
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [payOpen, setPayOpen] = useState(false);
  const [payMethod, setPayMethod] = useState<PayMethod>('cash');
  const [received, setReceived] = useState('');
  const [success, setSuccess] = useState<SuccessState | null>(null);
  const [hl, setHl] = useState(0);
  const [hint, setHint] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const { data: allProducts = [] } = useProducts();
  const { data: categories = [] } = useCategories();
  const { data: customers = [] } = useCustomers();
  const createOrder = useCreateOrder();
  const customer = customers.find((c) => c.id === customerId)?.name ?? 'Khách lẻ';

  const products = allProducts.filter(
    (p) =>
      (cat === 'all' || p.cat === cat) &&
      (q === '' || p.name.toLowerCase().includes(q.toLowerCase()) || p.sku.toLowerCase().includes(q.toLowerCase())),
  );

  useEffect(() => {
    if (hl >= products.length) setHl(0);
  }, [products.length, hl]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (payOpen || scanOpen || success) return;
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (e.key === '/' || e.key === 'F2') {
        e.preventDefault();
        searchRef.current?.focus();
        searchRef.current?.select();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [payOpen, scanOpen, success]);

  useEffect(() => {
    const el = gridRef.current?.querySelector<HTMLElement>('.prod-card.hl');
    if (el && gridRef.current) {
      const cTop = gridRef.current.scrollTop;
      const cBot = cTop + gridRef.current.clientHeight;
      const eTop = el.offsetTop;
      const eBot = eTop + el.offsetHeight;
      if (eTop < cTop) gridRef.current.scrollTop = eTop - 8;
      else if (eBot > cBot) gridRef.current.scrollTop = eBot - gridRef.current.clientHeight + 8;
    }
  }, [hl]);

  const add = (p: Product) => {
    const eff = applyProductPromo(p);
    setCart((c) => {
      const i = c.findIndex((x) => x.id === p.id);
      if (i >= 0) {
        const n = [...c];
        n[i] = { ...n[i], qty: n[i].qty + 1 };
        return n;
      }
      return [
        ...c,
        {
          ...p,
          qty: 1,
          price: eff.price,
          original: eff.original,
          hasPromo: eff.hasPromo,
          promoLabel: p.promo?.label,
        },
      ];
    });
    toast(`Đã thêm: ${p.name}`);
  };

  const setQty = (id: string, qty: number) => {
    if (qty <= 0) {
      setCart((c) => c.filter((x) => x.id !== id));
      return;
    }
    setCart((c) => c.map((x) => (x.id === id ? { ...x, qty } : x)));
  };

  const subtotal = cart.reduce((s, x) => s + x.price * x.qty, 0);
  const productPromoSavings = cart.reduce((s, x) => s + ((x.original ?? x.price) - x.price) * x.qty, 0);
  const promoAmt = (() => {
    if (!promo) return 0;
    if (promo.type === 'percent') return Math.round((subtotal * promo.value) / 100);
    if (promo.type === 'fixed') return promo.value;
    return 0;
  })();
  const discAmt = Math.round((subtotal * discount) / 100);
  const total = Math.max(0, subtotal - promoAmt - discAmt);
  const cost = cart.reduce((s, x) => s + x.cost * x.qty, 0);
  const profit = total - cost;

  const handleSearchKey = (e: ReactKeyboardEvent<HTMLInputElement>) => {
    const cols = (() => {
      if (!gridRef.current) return 4;
      const card = gridRef.current.querySelector<HTMLElement>('.prod-card');
      if (!card) return 4;
      return Math.max(1, Math.floor(gridRef.current.clientWidth / card.offsetWidth));
    })();
    const input = e.currentTarget;

    if (e.key === 'Enter') {
      e.preventDefault();
      const target = products[hl] ?? products[0];
      if (target) add(target);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHl((i) => Math.min(products.length - 1, i + cols));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHl((i) => Math.max(0, i - cols));
    } else if (e.key === 'ArrowRight' && (q === '' || input.selectionStart === q.length)) {
      e.preventDefault();
      setHl((i) => Math.min(products.length - 1, i + 1));
    } else if (e.key === 'ArrowLeft' && (q === '' || input.selectionStart === 0)) {
      e.preventDefault();
      setHl((i) => Math.max(0, i - 1));
    } else if (e.key === 'Escape') {
      e.preventDefault();
      if (q) setQ('');
      else input.blur();
      setHl(0);
    } else if (e.key === 'Delete') {
      e.preventDefault();
      const target = products[hl];
      if (target && cart.find((x) => x.id === target.id)) {
        const cur = cart.find((x) => x.id === target.id)!;
        setQty(target.id, cur.qty - 1);
      } else if (cart.length > 0) {
        const last = cart[cart.length - 1];
        setQty(last.id, last.qty - 1);
      }
    } else if (e.key === 'Backspace' && q === '' && cart.length > 0) {
      e.preventDefault();
      const last = cart[cart.length - 1];
      setQty(last.id, last.qty - 1);
    }
  };

  const finishPay = () => {
    const receivedAmt = payMethod === 'cash' ? Number(received || total) : total;
    createOrder.mutate(
      {
        customerId,
        items: cart.map((x) => ({ product_id: x.id, quantity: x.qty })),
        payment: PAY_TO_BE[payMethod],
        note: promo ? `Mã: ${promo.code}` : undefined,
      },
      {
        onSuccess: (orderId) => {
          setSuccess({
            id: shortOrderId(orderId),
            total,
            items: cart.reduce((s, x) => s + x.qty, 0),
            method: payMethod,
            received: receivedAmt,
            change: payMethod === 'cash' ? Math.max(0, receivedAmt - total) : 0,
          });
        },
        onError: (e) => toast(e instanceof Error ? e.message : 'Lỗi khi tạo đơn', 'warn'),
      },
    );
  };

  const closeSuccess = () => {
    setSuccess(null);
    setPayOpen(false);
    setCart([]);
    setPromo(null);
    setDiscount(0);
    setReceived('');
    setCustomerId(null);
    toast('Đã lưu đơn hàng', 'ok');
  };

  return (
    <div className="pos">
      <div className="pos-left">
        <div className="pos-toolbar">
          <div className="pos-search">
            <I.search size={15} />
            <input
              ref={searchRef}
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setHl(0);
              }}
              onKeyDown={handleSearchKey}
              placeholder="Tìm tên hoặc SKU…  /  bấm “/” để focus, ↑↓ chọn, Enter thêm"
            />
            {q && (
              <button
                className="pos-search-clear"
                onClick={() => {
                  setQ('');
                  setHl(0);
                  searchRef.current?.focus();
                }}
                title="Xóa (Esc)"
              >
                ×
              </button>
            )}
            <button className="pos-search-help" onClick={() => setHint((h) => !h)} title="Phím tắt">
              ⌨
            </button>
            {hint && (
              <div className="pos-kbd-pop" onClick={(e) => e.stopPropagation()}>
                <div className="pkp-title">Phím tắt POS</div>
                <div className="pkp-row">
                  <kbd>↑</kbd><kbd>↓</kbd><kbd>←</kbd><kbd>→</kbd>
                  <span>Di chuyển sản phẩm</span>
                </div>
                <div className="pkp-row">
                  <kbd>Enter</kbd>
                  <span>Thêm sản phẩm đang chọn vào giỏ</span>
                </div>
                <div className="pkp-row">
                  <kbd>Delete</kbd>
                  <span>Giảm SL sản phẩm đang chọn / SP cuối trong giỏ</span>
                </div>
                <div className="pkp-row">
                  <kbd>Backspace</kbd>
                  <span>(khi ô tìm trống) giảm SL SP cuối trong giỏ</span>
                </div>
                <div className="pkp-row">
                  <kbd>Esc</kbd>
                  <span>Xóa nội dung tìm kiếm</span>
                </div>
                <div className="pkp-row">
                  <kbd>/</kbd>
                  <span>hoặc <kbd>F2</kbd> — focus ô tìm kiếm từ bất kỳ đâu</span>
                </div>
                <div className="pkp-foot">💡 Quét máy bắn mã vạch cũng dùng được — chỉ cần focus ô này.</div>
              </div>
            )}
          </div>
          <button className="btn primary" onClick={() => setScanOpen(true)}>
            <I.scan size={15} /> Quét QR
          </button>
        </div>

        <div className="pos-cats">
          <button className={`chip-tab ${cat === 'all' ? 'on' : ''}`} onClick={() => setCat('all')}>
            Tất cả<em>{allProducts.length}</em>
          </button>
          {categories.map((c) => (
            <button key={c.id} className={`chip-tab ${cat === c.id ? 'on' : ''}`} onClick={() => setCat(c.id)}>
              <span className="cat-ic">{c.icon}</span>
              {c.name}
              <em>{allProducts.filter((p) => p.cat === c.id).length}</em>
            </button>
          ))}
        </div>

        <div className="pos-grid" ref={gridRef}>
          {products.map((p, idx) => {
            const eff = applyProductPromo(p);
            return (
              <button
                key={p.id}
                className={`prod-card ${eff.hasPromo ? 'has-promo' : ''} ${idx === hl ? 'hl' : ''}`}
                onClick={() => add(p)}
                disabled={!p.service && p.stock <= 0}
              >
                <div className="prod-thumb">
                  <span className="prod-cat">{categories.find((c) => c.id === p.cat)?.icon}</span>
                  {p.stock > 0 && p.stock <= p.min && !p.service && <span className="prod-low">Sắp hết</span>}
                  {p.service && <span className="prod-svc">Dịch vụ</span>}
                  {eff.hasPromo && p.promo && (
                    <span className="prod-promo">
                      {p.promo.type === 'percent' ? `−${p.promo.value}%` : `−${fmt(p.promo.value / 1000)}k`}
                    </span>
                  )}
                </div>
                <div className="prod-name">{p.name}</div>
                <div className="prod-row">
                  {eff.hasPromo ? (
                    <span className="prod-price promo">
                      <s>{fmt(eff.original)}</s>
                      {fmt(eff.price)}<i>₫</i>
                    </span>
                  ) : (
                    <span className="prod-price">
                      {fmt(p.price)}<i>₫</i>
                    </span>
                  )}
                  <span className="prod-stock">{p.service ? `/ ${p.unit}` : `${p.stock} ${p.unit}`}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="pos-right">
        <div className="cart-head">
          <div>
            <div className="cart-title">Giỏ hàng</div>
            <div className="cart-cust">
              <I.user size={12} />
              <select value={customerId ?? ''} onChange={(e) => setCustomerId(e.target.value || null)}>
                <option value="">Khách lẻ</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>
          {cart.length > 0 && (
            <button className="iconbtn" onClick={() => setCart([])} title="Xóa giỏ">
              <I.trash size={15} />
            </button>
          )}
        </div>

        <div className="cart-list">
          {cart.length === 0 ? (
            <EmptyState icon={<I.pos size={28} />} title="Giỏ trống" hint="Quét QR hoặc chọn sản phẩm bên trái" />
          ) : (
            cart.map((x) => (
              <div key={x.id} className="cart-item">
                <div className="ci-name">
                  {x.name}
                  {x.hasPromo && (
                    <span className="ci-promo-tag">
                      {x.promoLabel ?? 'KM'} · −{fmt((x.original ?? x.price) - x.price)}₫/{x.unit}
                    </span>
                  )}
                  <span>
                    {x.hasPromo ? (
                      <>
                        <s>{fmt(x.original ?? x.price)}₫</s> {fmt(x.price)}₫
                      </>
                    ) : (
                      <>{fmt(x.price)}₫</>
                    )}{' '}
                    · {x.unit}
                  </span>
                </div>
                <div className="qty">
                  <button onClick={() => setQty(x.id, x.qty - 1)}>
                    <I.minus size={12} sw={2.4} />
                  </button>
                  <input
                    value={x.qty}
                    onChange={(e) => setQty(x.id, Math.max(0, parseInt(e.target.value) || 0))}
                  />
                  <button onClick={() => setQty(x.id, x.qty + 1)}>
                    <I.plus size={12} sw={2.4} />
                  </button>
                </div>
                <div className="ci-sum">
                  {fmt(x.price * x.qty)}<i>₫</i>
                </div>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="cart-foot">
            <div className="promo-row">
              <I.promo size={14} />
              <select
                value={promo?.code ?? ''}
                onChange={(e) => {
                  const code = e.target.value;
                  setPromo(code ? PROMOS.find((p) => p.code === code) ?? null : null);
                }}
              >
                <option value="">— Chọn khuyến mãi —</option>
                {PROMOS.filter((p) => p.active).map((p) => (
                  <option key={p.id} value={p.code}>
                    {p.code} · {p.name}
                  </option>
                ))}
              </select>
            </div>
            {productPromoSavings > 0 && (
              <div className="line">
                <span>Giá gốc</span>
                <b className="strike">{fmt(subtotal + productPromoSavings)}₫</b>
              </div>
            )}
            {productPromoSavings > 0 && (
              <div className="line discount">
                <span>KM trên sản phẩm</span>
                <b>−{fmt(productPromoSavings)}₫</b>
              </div>
            )}
            <div className="line">
              <span>Tạm tính</span>
              <b>{fmt(subtotal)}₫</b>
            </div>
            {promo && (
              <div className="line discount">
                <span>Mã {promo.code}</span>
                <b>−{fmt(promoAmt)}₫</b>
              </div>
            )}
            <div className="line">
              <span>
                Giảm thêm{' '}
                <input
                  type="number"
                  value={discount}
                  min={0}
                  max={50}
                  onChange={(e) => setDiscount(Math.max(0, Math.min(50, Number(e.target.value) || 0)))}
                />
                %
              </span>
              <b>−{fmt(discAmt)}₫</b>
            </div>
            <div className="line total">
              <span>Tổng tiền</span>
              <b>
                {fmt(total)}<i>₫</i>
              </b>
            </div>
            <div className="line profit">
              <span>Lợi nhuận đơn này</span>
              <b>{fmt(profit)}₫</b>
            </div>
            <button className="btn primary big" onClick={() => setPayOpen(true)}>
              <I.flash size={15} /> Thanh toán · {fmt(total)}₫
            </button>
          </div>
        )}
      </div>

      {scanOpen && <QRScanner onScan={add} onClose={() => setScanOpen(false)} mode="sell" />}

      {payOpen && !success && (
        <div className="modal-veil" onClick={() => setPayOpen(false)}>
          <div className="modal pay" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <div>
                <div className="modal-title">Thanh toán</div>
                <div className="modal-sub">
                  {cart.reduce((s, x) => s + x.qty, 0)} sản phẩm · Khách: {customer}
                </div>
              </div>
              <button className="iconbtn" onClick={() => setPayOpen(false)}>
                <I.x />
              </button>
            </div>
            <div className="pay-body">
              <div className="pay-methods">
                {(
                  [
                    { id: 'cash' as const, label: 'Tiền mặt', icon: <I.cash size={18} /> },
                    { id: 'qr' as const, label: 'QR Chuyển khoản', icon: <I.qr size={18} /> },
                    { id: 'card' as const, label: 'Quẹt thẻ', icon: <I.card size={18} /> },
                  ] satisfies { id: PayMethod; label: string; icon: ReactNode }[]
                ).map((m) => (
                  <button
                    key={m.id}
                    className={`pay-method ${payMethod === m.id ? 'on' : ''}`}
                    onClick={() => setPayMethod(m.id)}
                  >
                    {m.icon}
                    <span>{m.label}</span>
                  </button>
                ))}
              </div>

              <div className="pay-amount">
                <div className="pay-amt-lbl">Tổng phải thu</div>
                <div className="pay-amt-val">
                  {fmt(total)}<i>₫</i>
                </div>
              </div>

              {payMethod === 'cash' && (
                <div className="pay-cash">
                  <label>Khách đưa</label>
                  <div className="cash-input">
                    <input
                      type="number"
                      value={received}
                      onChange={(e) => setReceived(e.target.value)}
                      placeholder={fmt(total)}
                    />
                    <i>₫</i>
                  </div>
                  <div className="cash-quick">
                    {[total, 100000, 200000, 500000, 1000000]
                      .filter((v, i, a) => a.indexOf(v) === i)
                      .map((v) => (
                        <button key={v} onClick={() => setReceived(String(v))}>
                          {fmt(v)}
                        </button>
                      ))}
                  </div>
                  <div className="cash-change">
                    <span>Tiền thối</span>
                    <b>{fmt(Math.max(0, (Number(received) || 0) - total))}₫</b>
                  </div>
                </div>
              )}
              {payMethod === 'qr' && <PaymentQR amount={total} orderId="DH-2604-NEW" />}
              {payMethod === 'card' && (
                <div className="pay-card">
                  <div className="card-mock">
                    <div className="card-bank">VCB Connect</div>
                    <div className="card-prompt">Đưa thẻ vào máy POS…</div>
                    <div className="card-pulse" />
                  </div>
                </div>
              )}
            </div>
            <div className="modal-foot">
              <button className="btn ghost" onClick={() => setPayOpen(false)}>
                Hủy
              </button>
              <button className="btn primary" onClick={finishPay} disabled={createOrder.isPending}>
                {createOrder.isPending ? 'Đang ghi đơn…' : `Hoàn tất · ${fmt(total)}₫`}
              </button>
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="modal-veil">
          <div className="modal success" onClick={(e) => e.stopPropagation()}>
            <div className="success-ring">
              <I.check size={32} sw={3} />
            </div>
            <div className="success-title">Đã thu {fmt(success.total)}₫</div>
            <div className="success-sub">
              Đơn {success.id} · {success.items} sản phẩm
            </div>
            {success.method === 'cash' && (
              <div className="success-change">
                <span>Tiền thối</span>
                <b>{fmt(success.change)}₫</b>
              </div>
            )}
            <div className="success-actions">
              <button className="btn ghost">
                <I.print size={14} /> In hóa đơn
              </button>
              <button className="btn primary" onClick={closeSuccess}>
                Đơn mới
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
