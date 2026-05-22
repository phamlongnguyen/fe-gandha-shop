import { useEffect, useState } from 'react';
import { I } from '@/components/icons';
import { PRODUCTS } from '@/mocks/products';
import { fmt } from '@/lib/format';
import type { Product } from '@/types';
import QRCode from './qr-code';

export type ScannerMode = 'sell' | 'inventory';

interface QRScannerProps {
  onScan: (p: Product) => void;
  onClose: () => void;
  mode?: ScannerMode;
}

export default function QRScanner({ onScan, onClose, mode = 'sell' }: QRScannerProps) {
  const [progress, setProgress] = useState(0);
  const [scanned, setScanned] = useState<Product | null>(null);

  useEffect(() => {
    if (scanned) return;
    const id = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(id);
          const pool = PRODUCTS.filter((px) => !px.service && px.stock > 0);
          const pick = pool[Math.floor(Math.random() * pool.length)];
          setScanned(pick);
          return 100;
        }
        return p + 4;
      });
    }, 60);
    return () => clearInterval(id);
  }, [scanned]);

  const reset = () => {
    setScanned(null);
    setProgress(0);
  };

  return (
    <div className="modal-veil" onClick={onClose}>
      <div className="modal scanner" onClick={(e) => e.stopPropagation()}>
        <div className="scanner-head">
          <div>
            <div className="scanner-title">
              {mode === 'sell' ? 'Quét QR sản phẩm để bán' : 'Quét QR kiểm tra tồn kho'}
            </div>
            <div className="scanner-sub">Đưa mã vào khung — máy sẽ tự nhận diện</div>
          </div>
          <button className="iconbtn" onClick={onClose}>
            <I.x />
          </button>
        </div>

        <div className="scanner-stage">
          <div className="scanner-frame">
            <span className="corner tl" />
            <span className="corner tr" />
            <span className="corner bl" />
            <span className="corner br" />
            <div className="cam-bg" />
            {scanned ? (
              <div className="cam-qr-found">
                <QRCode value={scanned.sku} size={150} logo />
              </div>
            ) : (
              <div className="cam-qr-faint" style={{ opacity: progress / 120 }}>
                <QRCode value="loading" size={130} />
              </div>
            )}
            {!scanned && <div className="scan-line" style={{ top: `${10 + progress * 0.7}%` }} />}
          </div>
          <div className="scanner-hint">{scanned ? '✓ Đã nhận diện' : `Đang quét… ${progress}%`}</div>
        </div>

        {scanned && (
          <div className="scanner-result">
            <div className="sr-row">
              <div>
                <div className="sr-name">{scanned.name}</div>
                <div className="sr-meta">
                  SKU {scanned.sku} · Tồn {scanned.stock} {scanned.unit}
                </div>
              </div>
              <div className="sr-price">
                {fmt(scanned.price)}
                <span>₫</span>
              </div>
            </div>
            <div className="sr-actions">
              <button className="btn ghost" onClick={reset}>
                Quét lại
              </button>
              <button
                className="btn primary"
                onClick={() => {
                  onScan(scanned);
                  onClose();
                }}
              >
                {mode === 'sell' ? '＋ Thêm vào giỏ' : 'Xem chi tiết'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
