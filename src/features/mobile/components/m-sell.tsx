import { useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { I } from '@/components/icons';
import MHeader from './m-header';
import MPanel from './m-panel';
import MEmpty from './m-empty';
import { useCategories } from '@/features/categories/hooks/use-categories';
import { useProducts } from '@/features/inventory/hooks/use-products';
import { useCustomersAll } from '@/features/customers/hooks/use-customers';
import { useActiveShopPromos } from '@/features/promo/hooks/use-promos';
import { useCreateOrder, type PaymentMethod } from '@/features/pos/hooks/use-create-order';
import { shortOrderId } from '@/features/orders/hooks/use-orders';
import { applyProductPromo } from '@/lib/promo';
import { fmt } from '@/lib/format';
import type { CartItem, Product, ShopPromo } from '@/types';
import type { MToastPush } from './m-toaster';

type PayMethod = 'cash' | 'qr' | 'card';

const PAY_TO_BE: Record<PayMethod, PaymentMethod> = {
  cash: 'cash', qr: 'transfer', card: 'card',
};

interface SuccessState {
  id: string;
  total: number;
  items: number;
  method: PayMethod;
  change: number;
}

interface MSellProps {
  cart: CartItem[];
  setCart: Dispatch<SetStateAction<CartItem[]>>;
  customerId: string | null;
  setCustomerId: Dispatch<SetStateAction<string | null>>;
  toast: MToastPush;
  onScanReq: () => void;
}

export default function MSell({ cart, setCart, customerId, setCustomerId, toast, onScanReq }: MSellProps) {
  const { data: allProducts = [] } = useProducts();
  const { data: categories = [] } = useCategories();
  const { data: customers = [] } = useCustomersAll();
  const { data: shopPromos = [] } = useActiveShopPromos();
  const createOrder = useCreateOrder();

  const [q, setQ] = useState('');
  const [cat, setCat] = useState<'all' | string>('all');
  const [cartOpen, setCartOpen] = useState(false);
  const [payOpen, setPayOpen] = useState(false);
  const [success, setSuccess] = useState<SuccessState | null>(null);
  const [payMethod, setPayMethod] = useState<PayMethod>('cash');
  const [received, setReceived] = useState('');
  const [discount, setDiscount] = useState(0);
  const [promo, setPromo] = useState<ShopPromo | null>(null);

  const customerName = customers.find((c) => c.id === customerId)?.name ?? 'Khách lẻ';

  const products = allProducts.filter(
    (p) =>
      (cat === 'all' || p.cat === cat) &&
      (q === '' || p.name.toLowerCase().includes(q.toLowerCase()) || p.sku.toLowerCase().includes(q.toLowerCase())),
  );

  const add = (p: Product) => {
    const eff = applyProductPromo(p);
    setCart((c) => {
      const i = c.findIndex((x) => x.id === p.id);
      if (i >= 0) {
        const n = [...c];
        n[i] = { ...n[i], qty: n[i].qty + 1 };
        return n;
      }
      return [...c, { ...p, qty: 1, price: eff.price, original: eff.original, hasPromo: eff.hasPromo, promoLabel: p.promo?.label }];
    });
    toast(`Đã thêm: ${p.name}`);
  };
  const setQty = (id: string, qty: number) => {
    if (qty <= 0) return setCart((c) => c.filter((x) => x.id !== id));
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
  const totalQty = cart.reduce((s, x) => s + x.qty, 0);

  const finishPay = () => {
    const receivedAmt = payMethod === 'cash' ? Number(received || total) : total;
    createOrder.mutate(
      {
        customerId,
        items: cart.map((x) => ({ product_id: x.id, quantity: x.qty })),
        payment: PAY_TO_BE[payMethod],
        promoCode: promo?.code ?? null,
        discountPct: discount,
        receivedAmount: payMethod === 'cash' ? receivedAmt : null,
      },
      {
        onSuccess: (orderId) => {
          setSuccess({
            id: shortOrderId(orderId),
            total, items: totalQty, method: payMethod,
            change: payMethod === 'cash' ? Math.max(0, receivedAmt - total) : 0,
          });
        },
        onError: (e) => toast(e instanceof Error ? e.message : 'Lỗi khi tạo đơn'),
      },
    );
  };

  const reset = () => {
    setSuccess(null); setPayOpen(false); setCartOpen(false);
    setCart([]); setPromo(null); setDiscount(0); setReceived('');
    setCustomerId(null);
    toast('Đã lưu đơn hàng');
  };

  return (
    <>
      <MHeader
        title="Bán hàng"
        sub="Quét QR hoặc chạm để thêm"
        right={<button className="m-header-btn" onClick={onScanReq}><I.scan size={18} /></button>}
      />

      <div className={`m-body${cart.length > 0 && !cartOpen && !payOpen && !success ? ' has-cart-fab' : ''}`}>
        <div className="m-search">
          <I.search size={16} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tìm sản phẩm hoặc SKU…" />
          {q && <button onClick={() => setQ('')}><I.x size={14} /></button>}
        </div>

        <div className="m-cats">
          <button className={`m-cat ${cat === 'all' ? 'on' : ''}`} onClick={() => setCat('all')}>
            Tất cả<em>{allProducts.length}</em>
          </button>
          {categories.map((c) => (
            <button key={c.id} className={`m-cat ${cat === c.id ? 'on' : ''}`} onClick={() => setCat(c.id)}>
              <span>{c.icon}</span> {c.name}
              <em>{allProducts.filter((p) => p.cat === c.id).length}</em>
            </button>
          ))}
        </div>

        <div className="m-prods">
          {products.length === 0 && <MEmpty icon={<I.search size={26} />} title="Không tìm thấy" hint={`Cho "${q}"`} />}
          {products.map((p) => {
            const eff = applyProductPromo(p);
            const inCart = cart.find((x) => x.id === p.id);
            const c = categories.find((x) => x.id === p.cat);
            return (
              <div key={p.id} className="m-prod" onClick={() => !inCart && add(p)}>
                <div className="m-prod-thumb">
                  <span>{c?.icon ?? '•'}</span>
                  {!p.service && p.stock > 0 && p.stock <= p.min && <span className="low" />}
                  {eff.hasPromo && p.promo && <span className="km">−{p.promo.type === 'percent' ? `${p.promo.value}%` : `${Math.round(p.promo.value / 1000)}k`}</span>}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div className="m-prod-name">{p.name}</div>
                  <div className="m-prod-meta">
                    <span className="mono">{p.sku.slice(-7)}</span>
                    <span className="dot" />
                    <span>{p.service ? 'dịch vụ' : `tồn ${p.stock} ${p.unit}`}</span>
                  </div>
                </div>
                <div className="m-prod-right">
                  {eff.hasPromo ? (
                    <div className="m-prod-price promo">
                      <s>{fmt(eff.original)}</s>{fmt(eff.price)}<i>₫</i>
                    </div>
                  ) : (
                    <div className="m-prod-price">{fmt(p.price)}<i>₫</i></div>
                  )}
                  {inCart ? (
                    <div className="m-prod-qty-mini" onClick={(e) => e.stopPropagation()}>
                      <button onClick={() => setQty(p.id, inCart.qty - 1)}><I.minus size={12} sw={2.4} /></button>
                      <span>{inCart.qty}</span>
                      <button onClick={() => setQty(p.id, inCart.qty + 1)}><I.plus size={12} sw={2.4} /></button>
                    </div>
                  ) : (
                    <button className="m-prod-add" onClick={(e) => { e.stopPropagation(); add(p); }}>
                      <I.plus size={16} sw={2.5} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {cart.length > 0 && !cartOpen && !payOpen && !success && (
        <button className="m-cart-fab" onClick={() => setCartOpen(true)}>
          <span className="badge">{totalQty}</span>
          <span className="lbl">
            Xem giỏ hàng
            <span>{cart.length} sản phẩm · {customerName}</span>
          </span>
          <span className="total">{fmt(total)}<i style={{ fontStyle: 'normal', fontSize: 11, opacity: 0.65, marginLeft: 1, fontWeight: 500 }}>₫</i></span>
          <I.arrowRight size={16} />
        </button>
      )}

      {cartOpen && (
        <MPanel
          onClose={() => setCartOpen(false)}
          title="Giỏ hàng"
          sub={`${totalQty} sản phẩm · Khách: ${customerName}`}
          right={<button className="m-header-btn" onClick={() => { setCart([]); setCartOpen(false); toast('Đã xóa giỏ'); }}><I.trash size={16} /></button>}
        >
          <div className="m-body" style={{ paddingBottom: 16 }}>
            <div style={{ padding: '12px 16px 0' }}>
              <div className="m-field" style={{ margin: '0 0 8px' }}>
                <label>Khách hàng</label>
                <select value={customerId ?? ''} onChange={(e) => setCustomerId(e.target.value || null)}>
                  <option value="">Khách lẻ</option>
                  {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>
            <div style={{ padding: '0 16px' }}>
              {cart.map((x) => {
                const c = categories.find((cc) => cc.id === x.cat);
                return (
                  <div key={x.id} className="m-ci">
                    <div className="m-ci-thumb">{c?.icon ?? '•'}</div>
                    <div style={{ minWidth: 0 }}>
                      <div className="m-ci-name">{x.name}</div>
                      <div className="m-ci-meta">
                        {x.hasPromo && <span className="promo-tag">{x.promoLabel ?? 'KM'}</span>}
                        <b>{fmt(x.price)}₫</b>
                        <span>/ {x.unit}</span>
                      </div>
                    </div>
                    <div className="m-qty">
                      <button onClick={() => setQty(x.id, x.qty - 1)}><I.minus size={14} sw={2.2} /></button>
                      <input value={x.qty} onChange={(e) => setQty(x.id, Math.max(0, parseInt(e.target.value) || 0))} />
                      <button onClick={() => setQty(x.id, x.qty + 1)}><I.plus size={14} sw={2.2} /></button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ padding: '12px 16px 0' }}>
              <div className="m-field">
                <label>Mã khuyến mãi</label>
                <select
                  value={promo?.code ?? ''}
                  onChange={(e) => {
                    const code = e.target.value;
                    setPromo(code ? shopPromos.find((p) => p.code === code) ?? null : null);
                  }}
                >
                  <option value="">— Chọn —</option>
                  {shopPromos.map((p) => <option key={p.id} value={p.code}>{p.code} · {p.name}</option>)}
                </select>
              </div>
              <div className="m-field">
                <label>Giảm thêm (%)</label>
                <input
                  type="number"
                  inputMode="numeric"
                  value={discount}
                  onChange={(e) => setDiscount(Math.max(0, Math.min(50, Number(e.target.value) || 0)))}
                />
              </div>
            </div>
          </div>

          <div className="m-sheet-foot" style={{ paddingBottom: 30 }}>
            <div className="m-totals">
              {productPromoSavings > 0 && <div className="m-tl discount"><span>KM trên SP</span><b>−{fmt(productPromoSavings)}₫</b></div>}
              <div className="m-tl"><span>Tạm tính</span><b>{fmt(subtotal)}₫</b></div>
              {promo && <div className="m-tl discount"><span>{promo.code}</span><b>−{fmt(promoAmt)}₫</b></div>}
              {discount > 0 && <div className="m-tl discount"><span>Giảm thêm {discount}%</span><b>−{fmt(discAmt)}₫</b></div>}
              <div className="m-tl total"><span>Tổng tiền</span><b>{fmt(total)}<i>₫</i></b></div>
            </div>
            <button className="m-btn" onClick={() => setPayOpen(true)}>
              <I.flash size={16} /> Thanh toán
            </button>
          </div>
        </MPanel>
      )}

      {payOpen && !success && (
        <MPanel
          onClose={() => setPayOpen(false)}
          title="Thanh toán"
          sub={`${totalQty} sản phẩm · ${customerName}`}
        >
          <div className="m-body" style={{ paddingBottom: 16 }}>
            <div style={{ padding: '12px 16px 0' }}>
              <div className="m-pay-methods">
                {([
                  { id: 'cash' as const, label: 'Tiền mặt', icon: <I.cash size={20} /> },
                  { id: 'qr' as const, label: 'QR / CK', icon: <I.qr size={20} /> },
                  { id: 'card' as const, label: 'Quẹt thẻ', icon: <I.card size={20} /> },
                ]).map((m) => (
                  <button key={m.id} className={`m-pay-method ${payMethod === m.id ? 'on' : ''}`} onClick={() => setPayMethod(m.id)}>
                    {m.icon}<span>{m.label}</span>
                  </button>
                ))}
              </div>

              <div style={{
                background: 'linear-gradient(135deg, var(--accent), var(--accent-deep))',
                color: 'white', padding: 18, borderRadius: 14, textAlign: 'center', marginBottom: 14,
              }}>
                <div style={{ fontSize: 11, opacity: 0.85, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Tổng phải thu</div>
                <div style={{ fontSize: 36, fontWeight: 800, letterSpacing: '-0.02em', marginTop: 4, fontVariantNumeric: 'tabular-nums' }}>
                  {fmt(total)}<i style={{ fontStyle: 'normal', fontSize: 18, opacity: 0.7, marginLeft: 4, fontWeight: 500 }}>₫</i>
                </div>
              </div>

              {payMethod === 'cash' && (
                <>
                  <div className="m-field">
                    <label>Khách đưa</label>
                    <input
                      type="number" inputMode="numeric" value={received}
                      onChange={(e) => setReceived(e.target.value)} placeholder={fmt(total)}
                      style={{ fontSize: 22, fontWeight: 700, fontVariantNumeric: 'tabular-nums', padding: 14 }}
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, marginTop: 4 }}>
                    {[total, 100000, 200000, 500000].filter((v, i, a) => a.indexOf(v) === i).map((v) => (
                      <button key={v} onClick={() => setReceived(String(v))} style={{
                        padding: '10px 4px', border: '1px solid var(--line)', background: 'var(--surface)',
                        borderRadius: 9, fontSize: 12, fontWeight: 600, fontVariantNumeric: 'tabular-nums', color: 'var(--ink-1)',
                      }}>{fmt(v)}</button>
                    ))}
                  </div>
                  <div style={{
                    display: 'flex', justifyContent: 'space-between',
                    padding: '12px 14px', marginTop: 12,
                    background: 'var(--accent-soft)', borderRadius: 11, fontSize: 13,
                  }}>
                    <span>Tiền thối</span>
                    <b style={{ fontSize: 17, color: 'var(--accent-deep)', fontVariantNumeric: 'tabular-nums' }}>
                      {fmt(Math.max(0, (Number(received) || 0) - total))}₫
                    </b>
                  </div>
                </>
              )}
              {payMethod === 'card' && (
                <div style={{
                  background: 'linear-gradient(135deg, #0c0a08, #2a1f10)', color: 'white',
                  borderRadius: 14, padding: '28px 18px', textAlign: 'center',
                }}>
                  <div style={{ fontSize: 11, opacity: 0.65, letterSpacing: '0.06em', textTransform: 'uppercase' }}>VCB Connect</div>
                  <div style={{ marginTop: 10, fontSize: 14 }}>Đưa thẻ vào máy POS…</div>
                </div>
              )}
            </div>
          </div>
          <div className="m-sheet-foot" style={{ paddingBottom: 30 }}>
            <button className="m-btn" onClick={finishPay} disabled={createOrder.isPending}>
              <I.check size={16} /> {createOrder.isPending ? 'Đang ghi đơn…' : `Hoàn tất · ${fmt(total)}₫`}
            </button>
          </div>
        </MPanel>
      )}

      {success && (
        <div className="m-success">
          <div className="m-success-card">
            <div className="m-success-ring"><I.check size={32} sw={3} /></div>
            <h2>Đã thu {fmt(success.total)}₫</h2>
            <p>{success.id} · {success.items} sản phẩm · {success.method === 'cash' ? 'Tiền mặt' : success.method === 'qr' ? 'QR' : 'Thẻ'}</p>
            {success.method === 'cash' && (
              <div className="m-success-meta">
                <span>Tiền thối</span><b>{fmt(success.change)}₫</b>
              </div>
            )}
            <div className="m-success-actions">
              <button className="m-btn ghost sm"><I.print size={14} /> In</button>
              <button className="m-btn sm" onClick={reset}>Đơn mới</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
