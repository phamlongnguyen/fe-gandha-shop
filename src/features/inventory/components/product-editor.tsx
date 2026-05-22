import { useRef, useState } from 'react';
import { I } from '@/components/icons';
import { useCategories } from '@/features/categories/hooks/use-categories';
import { useProducts } from '@/features/inventory/hooks/use-products';
import { uploadProductImage } from '@/lib/storage';
import { fmt, makeSku } from '@/lib/format';
import type { Product, ProductPromo, ProductPromoType } from '@/types';

interface ProductDraft {
  name: string;
  sku: string;
  cat: string;
  unit: string;
  cost: number;
  price: number;
  stock: number;
  min: number;
  service: boolean;
  promo: ProductPromo | null;
}

interface ProductEditorProps {
  product: Product | null;
  onClose: () => void;
  onSave: (draft: Omit<Product, 'id' | 'sold30'>) => void;
}

export default function ProductEditor({ product, onClose, onSave }: ProductEditorProps) {
  const isNew = !product;
  const { data: categories = [] } = useCategories();
  const { data: products = [] } = useProducts();
  const fileRef = useRef<HTMLInputElement>(null);
  const [imgUploading, setImgUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const handleImagePick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!product?.id || !e.target.files?.[0]) return;
    const file = e.target.files[0];
    setImgUploading(true);
    try {
      const url = await uploadProductImage(product.id, file);
      setImageUrl(url);
    } catch {
      // ignore upload error in editor — toast shown by parent
    } finally {
      setImgUploading(false);
    }
  };

  const [form, setForm] = useState<ProductDraft>(() => ({
    name: product?.name ?? '',
    sku: product?.sku ?? '',
    cat: product?.cat ?? 'vpp',
    unit: product?.unit ?? 'cái',
    cost: product?.cost ?? 0,
    price: product?.price ?? 0,
    stock: product?.stock ?? 0,
    min: product?.min ?? 10,
    service: product?.service ?? false,
    promo: product?.promo ? { ...product.promo } : null,
  }));

  const set = <K extends keyof ProductDraft>(k: K, v: ProductDraft[K]) => setForm((f) => ({ ...f, [k]: v }));

  const setPromo = (patch: Partial<ProductPromo>) =>
    setForm((f) => ({
      ...f,
      promo: f.promo
        ? { ...f.promo, ...patch }
        : { type: 'percent', value: 10, label: '', end: '', ...patch },
    }));

  const margin = form.price > 0 ? (((form.price - form.cost) / form.price) * 100).toFixed(1) : '0';

  const promoPrice = form.promo
    ? form.promo.type === 'percent'
      ? Math.round((form.price * (100 - (Number(form.promo.value) || 0))) / 100 / 100) * 100
      : Math.max(0, form.price - (Number(form.promo.value) || 0))
    : form.price;

  const submit = () => {
    if (!form.name.trim()) {
      alert('Vui lòng nhập tên sản phẩm');
      return;
    }
    const out: Omit<Product, 'id' | 'sold30'> = {
      name: form.name,
      sku: form.sku,
      cat: form.cat,
      unit: form.unit,
      cost: form.cost,
      price: form.price,
      stock: form.stock,
      min: form.min,
      service: form.service,
    };
    if (form.promo && form.promo.value) {
      out.promo = form.promo;
    }
    if (isNew && !out.sku) {
      const n = products.filter((p) => p.cat === out.cat).length + 1;
      out.sku = makeSku(out.cat, n);
    }
    onSave(out);
  };

  return (
    <div className="modal-veil" onClick={onClose}>
      <div className="modal pe-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div>
            <div className="modal-title">{isNew ? 'Thêm sản phẩm mới' : 'Sửa sản phẩm'}</div>
            <div className="modal-sub">{isNew ? 'Điền thông tin để thêm vào kho' : product?.sku}</div>
          </div>
          <button className="iconbtn" onClick={onClose}>
            <I.x />
          </button>
        </div>

        <div className="pe-body">
          {!isNew && (
            <div className="pe-section">
              <div className="pe-section-title">Hình ảnh sản phẩm</div>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                {imageUrl && (
                  <img src={imageUrl} alt="preview" style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 'var(--radius)', border: '1px solid var(--line)' }} />
                )}
                <button
                  type="button"
                  className="btn ghost compact"
                  onClick={() => fileRef.current?.click()}
                  disabled={imgUploading}
                >
                  <I.download size={13} /> {imgUploading ? 'Đang upload…' : 'Tải ảnh lên'}
                </button>
                <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImagePick} />
              </div>
            </div>
          )}
          <div className="pe-section">
            <div className="pe-row pe-row-full">
              <label>
                Tên sản phẩm <em>*</em>
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                placeholder="VD: Bút bi Thiên Long TL-027"
              />
            </div>
            <div className="pe-2col">
              <div className="pe-row">
                <label>Nhóm hàng</label>
                <select value={form.cat} onChange={(e) => set('cat', e.target.value)}>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.icon} {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="pe-row">
                <label>Đơn vị tính</label>
                <input
                  type="text"
                  value={form.unit}
                  onChange={(e) => set('unit', e.target.value)}
                  placeholder="cây / cái / hộp / đôi…"
                />
              </div>
            </div>
            <div className="pe-row pe-row-full">
              <label className="pe-check">
                <input
                  type="checkbox"
                  checked={form.service}
                  onChange={(e) => set('service', e.target.checked)}
                />
                <span>Dịch vụ (tồn kho không giới hạn — VD: photocopy, in ấn)</span>
              </label>
            </div>
          </div>

          <div className="pe-section">
            <div className="pe-section-title">Giá & tồn kho</div>
            <div className="pe-2col">
              <div className="pe-row">
                <label>
                  Giá vốn <em>*</em>
                </label>
                <div className="pe-money">
                  <input type="number" value={form.cost} onChange={(e) => set('cost', Number(e.target.value))} />
                  <span>₫</span>
                </div>
              </div>
              <div className="pe-row">
                <label>
                  Giá bán <em>*</em>
                </label>
                <div className="pe-money">
                  <input type="number" value={form.price} onChange={(e) => set('price', Number(e.target.value))} />
                  <span>₫</span>
                </div>
              </div>
            </div>
            <div className="pe-margin">
              Lợi nhuận / SP: <b>{fmt(form.price - form.cost)}₫</b> · Biên:{' '}
              <b className={Number(margin) > 30 ? 'up' : 'dn'}>{margin}%</b>
            </div>
            {!form.service && (
              <div className="pe-2col">
                <div className="pe-row">
                  <label>Tồn kho hiện tại</label>
                  <input type="number" value={form.stock} onChange={(e) => set('stock', Number(e.target.value))} />
                </div>
                <div className="pe-row">
                  <label>Cảnh báo khi dưới</label>
                  <input type="number" value={form.min} onChange={(e) => set('min', Number(e.target.value))} />
                </div>
              </div>
            )}
          </div>

          <div className="pe-section">
            <div className="pe-section-title">
              Khuyến mãi trên sản phẩm
              <label className="pe-check inline">
                <input
                  type="checkbox"
                  checked={!!form.promo}
                  onChange={(e) =>
                    set('promo', e.target.checked ? { type: 'percent', value: 10, label: '', end: '' } : null)
                  }
                />
                <span>Bật KM</span>
              </label>
            </div>
            {form.promo ? (
              <>
                <div className="pe-row">
                  <label>Loại giảm</label>
                  <div className="seg">
                    <button
                      type="button"
                      className={form.promo.type === 'percent' ? 'on' : ''}
                      onClick={() => setPromo({ type: 'percent' satisfies ProductPromoType })}
                    >
                      Phần trăm (%)
                    </button>
                    <button
                      type="button"
                      className={form.promo.type === 'fixed' ? 'on' : ''}
                      onClick={() => setPromo({ type: 'fixed' satisfies ProductPromoType })}
                    >
                      Số tiền cố định
                    </button>
                  </div>
                </div>
                <div className="pe-2col">
                  <div className="pe-row">
                    <label>Giá trị giảm</label>
                    <div className="pe-money">
                      <input
                        type="number"
                        value={form.promo.value}
                        onChange={(e) => setPromo({ value: Number(e.target.value) || 0 })}
                      />
                      <span>{form.promo.type === 'percent' ? '%' : '₫'}</span>
                    </div>
                  </div>
                  <div className="pe-row">
                    <label>Hết hạn</label>
                    <input
                      type="date"
                      value={form.promo.end ?? ''}
                      onChange={(e) => setPromo({ end: e.target.value })}
                    />
                  </div>
                </div>
                <div className="pe-row pe-row-full">
                  <label>Nhãn hiển thị (tuỳ chọn)</label>
                  <input
                    type="text"
                    value={form.promo.label ?? ''}
                    onChange={(e) => setPromo({ label: e.target.value })}
                    placeholder="VD: Sale hè, Xả tồn, Tựu trường…"
                  />
                </div>
                <div className="pe-promo-prev">
                  <div>
                    <span>Giá gốc</span>
                    <b>{fmt(form.price)}₫</b>
                  </div>
                  <I.arrowRight size={14} />
                  <div>
                    <span>Sau KM</span>
                    <b style={{ color: '#E11D48' }}>{fmt(promoPrice)}₫</b>
                  </div>
                  <div>
                    <span>Khách giảm</span>
                    <b style={{ color: '#E11D48' }}>−{fmt(form.price - promoPrice)}₫</b>
                  </div>
                </div>
              </>
            ) : (
              <div className="pe-promo-empty">
                Bật KM để đặt giảm giá riêng cho sản phẩm này. Khách sẽ thấy ribbon đỏ trên thẻ SP và giá gạch ngang.
              </div>
            )}
          </div>
        </div>

        <div className="modal-foot">
          <button className="btn ghost" onClick={onClose}>
            Hủy
          </button>
          <button className="btn primary" onClick={submit}>
            {isNew ? 'Thêm sản phẩm' : 'Lưu thay đổi'}
          </button>
        </div>
      </div>
    </div>
  );
}
