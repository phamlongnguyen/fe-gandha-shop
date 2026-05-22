import { useEffect, useRef, useState } from 'react';
import { I } from '@/components/icons';
import MHeader from './m-header';
import { useCategories } from '@/features/categories/hooks/use-categories';
import { useProductsInfinite } from '@/features/inventory/hooks/use-products';
import type { Product } from '@/types';

interface MStockProps {
  onScanReq: () => void;
}

function stockLevel(p: Product): 'ok' | 'low' | 'out' {
  if (p.service) return 'ok';
  if (p.stock <= 0) return 'out';
  if (p.stock <= p.min) return 'low';
  return 'ok';
}

function stockLabel(p: Product): string {
  if (p.service) return 'Dịch vụ';
  if (p.stock <= 0) return 'Hết';
  if (p.stock <= p.min) return 'Sắp hết';
  return 'Đủ';
}

export default function MStock({ onScanReq }: MStockProps) {
  const [q, setQ] = useState('');
  const [debouncedQ, setDebouncedQ] = useState('');
  const [cat, setCat] = useState<'all' | string>('all');
  const { data: categories = [] } = useCategories();
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const id = setTimeout(() => setDebouncedQ(q), 250);
    return () => clearTimeout(id);
  }, [q]);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useProductsInfinite({ pageSize: 30, search: debouncedQ, cat });

  const products = (data?.pages.flatMap((p) => p.rows) ?? []).filter((p) => !p.service);
  const total = data?.pages[0]?.total ?? 0;

  // Intersection observer for infinite scroll
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasNextPage) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: '200px' },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <>
      <MHeader
        title="Tồn kho"
        sub={`${total} sản phẩm`}
        right={<button className="m-header-btn" onClick={onScanReq}><I.scan size={18} /></button>}
      />
      <div className="m-body">
        <div className="m-search">
          <I.search size={16} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tìm hoặc quét SKU…" />
          {q && <button onClick={() => setQ('')}><I.x size={14} /></button>}
        </div>
        <div className="m-cats">
          <button className={`m-cat ${cat === 'all' ? 'on' : ''}`} onClick={() => setCat('all')}>Tất cả</button>
          {categories.map((c) => (
            <button key={c.id} className={`m-cat ${cat === c.id ? 'on' : ''}`} onClick={() => setCat(c.id)}>
              <span>{c.icon}</span> {c.name}
            </button>
          ))}
        </div>
        <div className="m-prods">
          {isLoading && (
            <div style={{ padding: 24, textAlign: 'center', color: 'var(--ink-3)', fontSize: 13 }}>
              Đang tải…
            </div>
          )}
          {!isLoading && products.length === 0 && (
            <div style={{ padding: 24, textAlign: 'center', color: 'var(--ink-3)', fontSize: 13 }}>
              Không tìm thấy sản phẩm
            </div>
          )}
          {products.map((p) => {
            const c = categories.find((x) => x.id === p.cat);
            const lvl = stockLevel(p);
            return (
              <div key={p.id} className="m-prod">
                <div className="m-prod-thumb">{c?.icon ?? '•'}</div>
                <div style={{ minWidth: 0 }}>
                  <div className="m-prod-name">{p.name}</div>
                  <div className="m-prod-meta">
                    <span className="mono">{p.sku.slice(-7)}</span>
                    <span className="dot" />
                    <span>min {p.min}</span>
                  </div>
                </div>
                <div className="m-prod-right">
                  <div className="m-prod-price" style={{ fontVariantNumeric: 'tabular-nums' }}>
                    {p.stock} <i style={{ fontStyle: 'normal', fontSize: 11, color: 'var(--ink-3)', fontWeight: 500 }}>{p.unit}</i>
                  </div>
                  <div style={{ marginTop: 4, textAlign: 'right' }}>
                    <span className={`stock-pill ${lvl}`}>{stockLabel(p)}</span>
                  </div>
                </div>
              </div>
            );
          })}

          {hasNextPage && (
            <div ref={sentinelRef} style={{ padding: 16, textAlign: 'center', color: 'var(--ink-3)', fontSize: 12 }}>
              {isFetchingNextPage ? 'Đang tải thêm…' : '⌄'}
            </div>
          )}
          {!hasNextPage && products.length > 0 && (
            <div style={{ padding: 12, textAlign: 'center', color: 'var(--ink-4)', fontSize: 11 }}>
              · hết · {total} sản phẩm ·
            </div>
          )}
        </div>
      </div>
    </>
  );
}
