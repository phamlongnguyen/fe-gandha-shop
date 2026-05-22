import { useState } from 'react';
import { I } from '@/components/icons';
import PageHead from '@/components/shared/page-head';
import { useCategories } from '@/features/categories/hooks/use-categories';
import { useProducts } from '@/features/inventory/hooks/use-products';
import {
  useShopPromos,
  useUpdateShopPromo,
  useUpsertProductPromo,
} from '@/features/promo/hooks/use-promos';
import { applyProductPromo } from '@/lib/promo';
import { fmt } from '@/lib/format';
import type { ProductPromo, ProductPromoType } from '@/types';
import type { ToastPush } from '@/lib/use-toasts';

interface PromoProps {
  toast: ToastPush;
}

type Draft = { type: ProductPromoType; value: number | string; label: string; end: string };
const emptyDraft: Draft = { type: 'percent', value: 10, label: '', end: '' };

export default function Promo({ toast }: PromoProps) {
  const { data: shopPromos = [] } = useShopPromos();
  const { data: products = [] } = useProducts();
  const { data: categories = [] } = useCategories();
  const updateShopPromo = useUpdateShopPromo();
  const upsertProductPromo = useUpsertProductPromo();

  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft>(emptyDraft);

  const prodPromos = products.filter((p) => p.promo);

  const toggle = (id: string, active: boolean) => {
    updateShopPromo.mutate(
      { id, patch: { active: !active } },
      { onError: (e) => toast(e instanceof Error ? e.message : 'Lỗi', 'warn') },
    );
  };

  const startEdit = (productId: string) => {
    const p = products.find((x) => x.id === productId);
    setEditing(productId);
    setDraft(
      p?.promo
        ? { type: p.promo.type, value: p.promo.value, label: p.promo.label ?? '', end: p.promo.end ?? '' }
        : { ...emptyDraft },
    );
  };

  const saveEdit = () => {
    if (!editing) return;
    const promo: ProductPromo = {
      type: draft.type,
      value: Number(draft.value) || 0,
      label: draft.label || undefined,
      end: draft.end || undefined,
    };
    upsertProductPromo.mutate(
      { productId: editing, promo },
      {
        onSuccess: () => { toast('Đã lưu khuyến mãi sản phẩm', 'ok'); setEditing(null); },
        onError: (e) => toast(e instanceof Error ? e.message : 'Lỗi', 'warn'),
      },
    );
  };

  const removeProdPromo = (productId: string) => {
    upsertProductPromo.mutate(
      { productId, promo: null },
      {
        onSuccess: () => toast('Đã gỡ khuyến mãi sản phẩm'),
        onError: (e) => toast(e instanceof Error ? e.message : 'Lỗi', 'warn'),
      },
    );
  };

  return (
    <div className="page">
      <PageHead
        title="Khuyến mãi & Giảm giá"
        subtitle="Mã giảm giá toàn shop · Khuyến mãi gắn theo từng sản phẩm"
        actions={
          <button className="btn primary" onClick={() => toast('Tính năng tạo mã KM sắp ra mắt')}>
            <I.plus size={14} /> Tạo mã KM
          </button>
        }
      />

      <div className="section-head">
        <h3>Mã khuyến mãi áp toàn đơn</h3>
        <span className="muted">
          {shopPromos.filter((p) => p.active).length}/{shopPromos.length} đang chạy
        </span>
      </div>

      <div className="promo-grid">
        {shopPromos.map((p) => (
          <div key={p.id} className={`promo-card ${p.active ? '' : 'off'}`}>
            <div className="pc-side" />
            <div className="pc-body">
              <div className="pc-top">
                <span className="pc-code">{p.code}</span>
                <button className="twk-toggle" data-on={p.active ? '1' : '0'} onClick={() => toggle(p.id, p.active)}>
                  <i />
                </button>
              </div>
              <div className="pc-name">{p.name}</div>
              <div className="pc-discount">
                {p.type === 'percent' && <><b>−{p.value}<i>%</i></b><span>theo phần trăm</span></>}
                {p.type === 'fixed' && <><b>−{fmt(p.value / 1000)}<i>k</i></b><span>cố định</span></>}
                {p.type === 'bogo' && <><b>{p.value}+1</b><span>mua nhiều tặng</span></>}
              </div>
              <div className="pc-meta">
                <div>
                  <span>Phạm vi</span>
                  <b>
                    {p.scope === 'all'
                      ? 'Toàn shop'
                      : p.scope.startsWith('cat')
                        ? `Nhóm: ${categories.find((c) => c.rowId === p.scope.split(':')[1])?.name ?? p.scope}`
                        : 'Sản phẩm cụ thể'}
                  </b>
                </div>
                <div><span>Đơn tối thiểu</span><b>{p.min === 0 ? '—' : `${fmt(p.min)}₫`}</b></div>
                <div><span>Đã dùng</span><b>{p.used} lượt</b></div>
                <div><span>Hết hạn</span><b>{p.end || 'Không hạn'}</b></div>
              </div>
              <div className="pc-actions">
                <button className="btn ghost compact"><I.edit size={13} /> Sửa</button>
                <button className="btn ghost compact"><I.copy size={13} /> Sao chép</button>
              </div>
            </div>
          </div>
        ))}
        {shopPromos.length === 0 && (
          <div style={{ padding: 24, color: 'var(--ink-3)', gridColumn: '1/-1' }}>Chưa có mã khuyến mãi nào.</div>
        )}
      </div>

      <div className="section-head" style={{ marginTop: 28 }}>
        <h3>Khuyến mãi theo sản phẩm</h3>
        <span className="muted">{prodPromos.length} sản phẩm đang có KM</span>
      </div>

      <div className="card">
        <table className="tbl">
          <thead>
            <tr>
              <th>Sản phẩm</th><th>Loại</th>
              <th className="r">Giá gốc</th><th className="r">Giảm</th>
              <th className="r">Giá KM</th><th>Nhãn</th><th>Hết hạn</th><th></th>
            </tr>
          </thead>
          <tbody>
            {prodPromos.map((p) => {
              const eff = applyProductPromo(p);
              if (!p.promo) return null;
              return (
                <tr key={p.id}>
                  <td>
                    <div className="pp-name">
                      <span className="pp-cat">{categories.find((c) => c.id === p.cat)?.icon}</span>
                      <div><b>{p.name}</b><span className="pp-sku">{p.sku}</span></div>
                    </div>
                  </td>
                  <td><span className="pill">{p.promo.type === 'percent' ? '% Phần trăm' : 'Cố định'}</span></td>
                  <td className="r mono">{fmt(p.price)}₫</td>
                  <td className="r mono down"><b>−{p.promo.type === 'percent' ? `${p.promo.value}%` : `${fmt(p.promo.value)}₫`}</b></td>
                  <td className="r mono"><b style={{ color: '#E11D48' }}>{fmt(eff.price)}₫</b></td>
                  <td>{p.promo.label ? <span className="pill ok">{p.promo.label}</span> : <span className="muted">—</span>}</td>
                  <td>{p.promo.end ?? <span className="muted">Không hạn</span>}</td>
                  <td className="r" style={{ whiteSpace: 'nowrap' }}>
                    <button className="iconbtn sm" onClick={() => startEdit(p.id)} title="Sửa"><I.edit size={13} /></button>
                    <button className="iconbtn sm" onClick={() => removeProdPromo(p.id)} title="Gỡ KM"><I.trash size={13} /></button>
                  </td>
                </tr>
              );
            })}
            {prodPromos.length === 0 && (
              <tr><td colSpan={8} style={{ textAlign: 'center', padding: '32px 0', color: 'var(--ink-3)' }}>Chưa có sản phẩm nào áp khuyến mãi.</td></tr>
            )}
          </tbody>
        </table>
        <div style={{ padding: '12px 16px', borderTop: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="muted">Mở từ trang Sản phẩm hoặc thêm mới ở đây</span>
          <button className="btn ghost compact" onClick={() => { const x = products.filter((p) => !p.promo)[0]; if (x) startEdit(x.id); }}>
            <I.plus size={13} /> Thêm KM cho sản phẩm
          </button>
        </div>
      </div>

      {editing && (() => {
        const p = products.find((x) => x.id === editing);
        if (!p) return null;
        const eff = draft.type === 'percent'
          ? Math.round((p.price * (100 - (Number(draft.value) || 0))) / 100 / 100) * 100
          : Math.max(0, p.price - (Number(draft.value) || 0));
        return (
          <div className="modal-veil" onClick={() => setEditing(null)}>
            <div className="modal pp-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-head">
                <div><div className="modal-title">Khuyến mãi sản phẩm</div><div className="modal-sub">{p.name}</div></div>
                <button className="iconbtn" onClick={() => setEditing(null)}><I.x /></button>
              </div>
              <div className="pp-form">
                <div className="pp-product-pick">
                  <label>Sản phẩm</label>
                  <select value={editing} onChange={(e) => startEdit(e.target.value)}>
                    {products.map((x) => (<option key={x.id} value={x.id}>{x.name}</option>))}
                  </select>
                </div>
                <div className="pp-row">
                  <label>Loại giảm</label>
                  <div className="seg">
                    <button className={draft.type === 'percent' ? 'on' : ''} onClick={() => setDraft((d) => ({ ...d, type: 'percent' }))}>Phần trăm (%)</button>
                    <button className={draft.type === 'fixed' ? 'on' : ''} onClick={() => setDraft((d) => ({ ...d, type: 'fixed' }))}>Số tiền cố định</button>
                  </div>
                </div>
                <div className="pp-row">
                  <label>Giá trị giảm</label>
                  <div className="pp-value-input">
                    <input type="number" value={draft.value} onChange={(e) => setDraft((d) => ({ ...d, value: e.target.value }))} />
                    <span>{draft.type === 'percent' ? '%' : '₫'}</span>
                  </div>
                </div>
                <div className="pp-row">
                  <label>Nhãn hiển thị</label>
                  <input type="text" value={draft.label} onChange={(e) => setDraft((d) => ({ ...d, label: e.target.value }))} placeholder="VD: Sale hè, Xả tồn…" />
                </div>
                <div className="pp-row">
                  <label>Hết hạn</label>
                  <input type="date" value={draft.end} onChange={(e) => setDraft((d) => ({ ...d, end: e.target.value }))} />
                </div>
                <div className="pp-preview">
                  <div className="pp-prev-row"><span>Giá gốc</span><b>{fmt(p.price)}₫</b></div>
                  <div className="pp-prev-row down"><span>Sau khuyến mãi</span><b>{fmt(eff)}₫</b></div>
                  <div className="pp-prev-row"><span>Khách tiết kiệm</span><b style={{ color: '#E11D48' }}>{fmt(p.price - eff)}₫</b></div>
                  <div className="pp-prev-row"><span>Lợi nhuận / SP</span><b className={eff > p.cost ? 'up' : 'down'}>{fmt(eff - p.cost)}₫</b></div>
                </div>
              </div>
              <div className="modal-foot">
                {p.promo && (
                  <button className="btn ghost" onClick={() => { removeProdPromo(p.id); setEditing(null); }}>
                    <I.trash size={13} /> Gỡ KM
                  </button>
                )}
                <div style={{ flex: 1 }} />
                <button className="btn ghost" onClick={() => setEditing(null)}>Hủy</button>
                <button className="btn primary" onClick={saveEdit} disabled={upsertProductPromo.isPending}>Lưu khuyến mãi</button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
