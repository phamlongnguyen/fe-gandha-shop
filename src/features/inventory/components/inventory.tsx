import { useEffect, useState } from 'react';
import { I } from '@/components/icons';
import PageHead from '@/components/shared/page-head';
import Pagination from '@/components/shared/pagination';
import Tabs from '@/components/shared/tabs';
import QRCode from '@/features/qr/components/qr-code';
import ProductEditor from './product-editor';
import { useCategories } from '@/features/categories/hooks/use-categories';
import {
  useCreateProduct,
  useDeleteProduct,
  useProductsPaged,
  useUpdateProduct,
} from '@/features/inventory/hooks/use-products';
import { fmt } from '@/lib/format';
import type { Product } from '@/types';
import type { ToastPush } from '@/lib/use-toasts';

const PAGE_SIZE = 50;

interface InventoryProps {
  setScanOpen: (open: boolean) => void;
  toast: ToastPush;
}

type CatFilter = string;

export default function Inventory({ setScanOpen, toast }: InventoryProps) {
  const [cat, setCat] = useState<CatFilter>('all');
  const [q, setQ] = useState('');
  const [debouncedQ, setDebouncedQ] = useState('');
  const [page, setPage] = useState(1);
  const [showQR, setShowQR] = useState<Product | null>(null);
  const [editing, setEditing] = useState<'new' | Product | null>(null);
  const { data: categories = [] } = useCategories();

  useEffect(() => {
    const id = setTimeout(() => { setDebouncedQ(q); setPage(1); }, 250);
    return () => clearTimeout(id);
  }, [q]);

  useEffect(() => { setPage(1); }, [cat]);

  const { data: pagedResult, isLoading } = useProductsPaged({ page, pageSize: PAGE_SIZE, search: debouncedQ, cat });
  const items = pagedResult?.rows ?? [];
  const total = pagedResult?.total ?? 0;

  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  const removeProduct = (id: string, name: string) => {
    deleteProduct.mutate(id, {
      onSuccess: () => toast(`Đã xóa "${name}"`),
      onError: (e) => toast(e instanceof Error ? e.message : 'Lỗi khi xóa', 'warn'),
    });
  };

  return (
    <div className="page">
      <PageHead
        title="Sản phẩm & Tồn kho"
        subtitle={isLoading ? 'Đang tải…' : `${total} sản phẩm`}
        actions={
          <>
            <button className="btn ghost" onClick={() => setScanOpen(true)}>
              <I.scan size={14} /> Quét tra tồn
            </button>
            <button className="btn ghost">
              <I.download size={14} /> Xuất Excel
            </button>
            <button className="btn primary" onClick={() => setEditing('new')}>
              <I.plus size={14} /> Thêm sản phẩm
            </button>
          </>
        }
      />

      <Tabs<CatFilter>
        value={cat}
        onChange={setCat}
        items={[
          { value: 'all', label: 'Tất cả' },
          ...categories.map((c) => ({ value: c.id, label: c.name })),
        ]}
      />

      <div className="card">
        <div className="card-head sticky-toolbar">
          <div className="pos-search w-360">
            <I.search size={15} />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tìm theo tên hoặc SKU…" />
          </div>
          <div className="card-head-actions">
            <button className="btn ghost compact">
              <I.filter size={14} /> Lọc
            </button>
          </div>
        </div>
        <table className="tbl prods">
          <thead>
            <tr>
              <th style={{ width: 40 }}></th>
              <th>Sản phẩm</th>
              <th>SKU</th>
              <th className="r">Giá vốn</th>
              <th className="r">Giá bán</th>
              <th className="r">Biên LN</th>
              <th className="r">Tồn kho</th>
              <th>KM</th>
              <th>Trạng thái</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.map((p) => {
              const margin = (((p.price - p.cost) / p.price) * 100).toFixed(1);
              const low = !p.service && p.stock <= p.min;
              const out = !p.service && p.stock <= 0;
              return (
                <tr key={p.id}>
                  <td>
                    <div className="prod-mini-thumb">{categories.find((c) => c.id === p.cat)?.icon}</div>
                  </td>
                  <td>
                    <b>{p.name}</b>
                    <span className="td-sub">{categories.find((c) => c.id === p.cat)?.name} · {p.unit}</span>
                  </td>
                  <td className="mono">{p.sku}</td>
                  <td className="r mono">{fmt(p.cost)}</td>
                  <td className="r mono"><b>{fmt(p.price)}</b></td>
                  <td className="r mono up">{margin}%</td>
                  <td className="r">
                    <b>{p.service ? '∞' : p.stock}</b>{' '}
                    <span className="td-sub">{p.unit}</span>
                  </td>
                  <td>
                    {p.promo ? (
                      <span className="pill km">
                        −{p.promo.type === 'percent' ? `${p.promo.value}%` : `${fmt(p.promo.value / 1000)}k`}
                      </span>
                    ) : (
                      <span className="td-sub">—</span>
                    )}
                  </td>
                  <td>
                    {p.service ? (
                      <span className="pill svc">Dịch vụ</span>
                    ) : out ? (
                      <span className="pill out">Hết hàng</span>
                    ) : low ? (
                      <span className="pill low">Sắp hết · {p.stock}/{p.min}</span>
                    ) : (
                      <span className="pill ok">Còn hàng</span>
                    )}
                  </td>
                  <td>
                    <div className="row-actions">
                      <button className="iconbtn sm" title="In QR" onClick={() => setShowQR(p)}>
                        <I.qr size={14} />
                      </button>
                      <button className="iconbtn sm" title="Sửa sản phẩm" onClick={() => setEditing(p)}>
                        <I.edit size={14} />
                      </button>
                      <button
                        className="iconbtn sm"
                        title="Xóa"
                        onClick={() => {
                          if (confirm(`Xóa sản phẩm "${p.name}"?`)) removeProduct(p.id, p.name);
                        }}
                      >
                        <I.trash size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {items.length === 0 && !isLoading && (
              <tr><td colSpan={10} style={{ textAlign: 'center', padding: 32, color: 'var(--ink-3)' }}>Không có sản phẩm nào khớp</td></tr>
            )}
          </tbody>
        </table>
        <Pagination page={page} pageSize={PAGE_SIZE} total={total} onChange={setPage} />
      </div>

      {editing && (
        <ProductEditor
          product={editing === 'new' ? null : editing}
          onClose={() => setEditing(null)}
          onSave={(p) => {
            const draft = {
              name: p.name,
              sku: p.sku,
              cat: p.cat,
              unit: p.unit,
              cost: p.cost,
              price: p.price,
              stock: p.stock,
              min: p.min,
              service: p.service ?? false,
              promo: p.promo ?? null,
            };
            const opts = {
              onSuccess: () => {
                toast(editing === 'new' ? `Đã thêm: ${p.name}` : 'Đã lưu thay đổi');
                setEditing(null);
              },
              onError: (e: unknown) =>
                toast(e instanceof Error ? e.message : 'Lỗi khi lưu', 'warn'),
            };
            if (editing === 'new') {
              createProduct.mutate(draft, opts);
            } else {
              updateProduct.mutate({ id: editing.id, patch: draft }, opts);
            }
          }}
        />
      )}

      {showQR && (
        <div className="modal-veil" onClick={() => setShowQR(null)}>
          <div className="modal qrlabel" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <div>
                <div className="modal-title">Xem trước tem dán</div>
                <div className="modal-sub">{showQR.name}</div>
              </div>
              <button className="iconbtn" onClick={() => setShowQR(null)}>
                <I.x />
              </button>
            </div>
            <div className="label-preview">
              <div className="label">
                <div className="label-brand">GANDHA</div>
                <QRCode value={showQR.sku} size={120} logo />
                <div className="label-sku">{showQR.sku}</div>
                <div className="label-name">{showQR.name}</div>
                <div className="label-price">
                  {fmt(showQR.price)}<i>₫</i> / {showQR.unit}
                </div>
              </div>
              <div className="label-info">
                <div className="li-row">
                  <span>Kích thước</span>
                  <b>50 × 70 mm</b>
                </div>
                <div className="li-row">
                  <span>Số lượng in</span>
                  <input type="number" defaultValue={1} min={1} />
                </div>
                <div className="li-row">
                  <span>Loại giấy</span>
                  <b>Decal trong</b>
                </div>
              </div>
            </div>
            <div className="modal-foot">
              <button className="btn ghost" onClick={() => setShowQR(null)}>
                Đóng
              </button>
              <button className="btn ghost">
                <I.download size={14} /> Tải PNG
              </button>
              <button
                className="btn primary"
                onClick={() => {
                  setShowQR(null);
                  toast('Đã gửi tới máy in tem');
                }}
              >
                <I.print size={14} /> In tem
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
