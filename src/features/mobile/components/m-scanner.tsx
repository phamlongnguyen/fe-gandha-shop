import { useEffect, useState } from 'react';
import { I } from '@/components/icons';
import { useCategories } from '@/features/categories/hooks/use-categories';
import { useProducts } from '@/features/inventory/hooks/use-products';
import { fmt } from '@/lib/format';
import type { Product } from '@/types';

export type ScannerMode = 'sell' | 'buy';

interface MScannerProps {
  onScan: (p: Product) => void;
  onClose: () => void;
  mode?: ScannerMode;
}

export default function MScanner({ onScan, onClose, mode = 'sell' }: MScannerProps) {
  const [phase, setPhase] = useState<'scanning' | 'found'>('scanning');
  const [hit, setHit] = useState<Product | null>(null);
  const [count, setCount] = useState(3);
  const { data: products = [] } = useProducts();
  const { data: categories = [] } = useCategories();

  useEffect(() => {
    if (phase !== 'scanning') return;
    const t = setInterval(() => setCount((c) => c - 1), 1000);
    return () => clearInterval(t);
  }, [phase]);

  useEffect(() => {
    if (count <= 0 && phase === 'scanning') {
      const pool = products.filter((p) => !p.service);
      if (pool.length > 0) {
        const pick = pool[Math.floor(Math.random() * pool.length)];
        setHit(pick);
        setPhase('found');
      }
    }
  }, [count, phase, products]);

  const reset = () => { setHit(null); setPhase('scanning'); setCount(3); };
  const catIcon = hit ? categories.find((c) => c.id === hit.cat)?.icon ?? '•' : '•';

  return (
    <div className="m-scan">
      <div className="m-scan-head">
        <button className="close" onClick={onClose}><I.x size={18} /></button>
        <h2>{mode === 'sell' ? 'Quét QR để bán' : 'Quét QR nhập kho'}</h2>
        <button className="close"><I.flash size={18} /></button>
      </div>

      <div className="m-scan-stage">
        <div className="m-scan-bg" />
        <div className="m-scan-target">
          <div className="c tl" /><div className="c tr" /><div className="c bl" /><div className="c br" />
        </div>
        {phase === 'scanning' && <div className="m-scan-line" />}
        {phase === 'scanning' && (
          <div className="m-scan-hint">Đưa mã QR vào khung · {Math.max(0, count)}s</div>
        )}
      </div>

      {phase === 'found' && hit && (
        <div className="m-scan-result">
          <div className="m-scan-result-row">
            <div style={{ width: 44, height: 44, borderRadius: 9, background: 'var(--accent-soft)', color: 'var(--accent-deep)', display: 'grid', placeItems: 'center', fontSize: 20 }}>
              {catIcon}
            </div>
            <div>
              <div className="m-scan-result-name">{hit.name}</div>
              <div className="m-scan-result-sku">{hit.sku} · tồn {hit.stock} {hit.unit}</div>
            </div>
            <div className="m-scan-result-price">
              {fmt(hit.price)}<i>₫</i>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="m-btn ghost sm" onClick={reset} style={{ flex: 1 }}>Quét tiếp</button>
            <button className="m-btn sm" onClick={() => { onScan(hit); onClose(); }} style={{ flex: 2 }}>
              <I.plus size={14} /> {mode === 'sell' ? 'Thêm vào giỏ' : 'Thêm vào phiếu'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
