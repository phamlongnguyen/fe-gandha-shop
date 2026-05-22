import { useNavigate } from 'react-router-dom';
import { I } from '@/components/icons';
import MHeader from './m-header';
import { useCategories } from '@/features/categories/hooks/use-categories';
import { useProducts } from '@/features/inventory/hooks/use-products';
import { shortOrderId, useOrders } from '@/features/orders/hooks/use-orders';
import { useDashboardToday } from '@/features/analytics/hooks/use-analytics';
import { fmt } from '@/lib/format';

interface MHomeProps {
  onScanReq: () => void;
}

export default function MHome({ onScanReq }: MHomeProps) {
  const navigate = useNavigate();
  const { data: today } = useDashboardToday();
  const { data: products = [] } = useProducts();
  const { data: categories = [] } = useCategories();
  const { data: ordersRes } = useOrders({ pageSize: 4 });
  const orders = ordersRes?.rows ?? [];

  const lowStock = products.filter((p) => !p.service && p.stock > 0 && p.stock <= p.min);
  const productCount = products.filter((p) => !p.service).length;

  const dateLine = new Date().toLocaleDateString('vi-VN', {
    weekday: 'long', day: '2-digit', month: '2-digit',
  });

  const todayRev = today?.revenue ?? 0;
  const todayProfit = today?.profit ?? 0;
  const todayOrders = today?.order_count ?? 0;
  const vsRev = today?.vs_yesterday_pct?.revenue ?? 0;

  return (
    <>
      <MHeader
        title="Gandha Shop"
        sub={`Hôm nay · ${dateLine}`}
        right={<button className="m-header-btn"><I.bell size={18} /></button>}
      />

      <div className="m-body">
        <div className="m-hero">
          <div className="m-hero-lbl">Doanh thu hôm nay</div>
          <div className="m-hero-val">{fmt(todayRev)}<i>₫</i></div>
          <div className="m-hero-stats">
            <div><b>{todayOrders}</b>đơn hàng</div>
            <div><b>{fmt(todayProfit)}₫</b>lợi nhuận</div>
            <div><b>{vsRev > 0 ? '+' : ''}{vsRev}%</b>vs hôm qua</div>
          </div>
        </div>

        <div className="m-quick">
          <button className="m-quick-tile dark" onClick={() => navigate('/m/sell')}>
            <div className="ic"><I.pos size={20} /></div>
            <b>Bán hàng</b>
            <span>Quét QR · POS</span>
          </button>
          <button className="m-quick-tile" onClick={() => navigate('/m/buy')}>
            <div className="ic"><I.purchase size={20} /></div>
            <b>Nhập hàng</b>
            <span>Tạo phiếu nhập</span>
          </button>
          <button className="m-quick-tile" onClick={onScanReq}>
            <div className="ic"><I.scan size={20} /></div>
            <b>Quét QR</b>
            <span>Bán hoặc tra cứu</span>
          </button>
          <button className="m-quick-tile" onClick={() => navigate('/m/stock')}>
            <div className="ic"><I.inventory size={20} /></div>
            <b>Tồn kho</b>
            <span>{productCount} sản phẩm</span>
          </button>
        </div>

        {lowStock.length > 0 && (
          <div className="m-section">
            <div className="m-section-title">
              <span>Sắp hết hàng</span>
              <em>{lowStock.length} sản phẩm</em>
            </div>
            <div className="m-card">
              {lowStock.slice(0, 4).map((p) => {
                const cat = categories.find((c) => c.id === p.cat);
                return (
                  <div key={p.id} className="m-row">
                    <div className="m-row-ic" style={{ background: 'rgba(245,158,11,0.14)', color: 'var(--warn)' }}>
                      {cat?.icon ?? '•'}
                    </div>
                    <div>
                      <div className="m-row-title">{p.name}</div>
                      <div className="m-row-sub">Min {p.min} · còn {p.stock} {p.unit}</div>
                    </div>
                    <div className="m-row-r">
                      <span className="stock-pill low">{p.stock}/{p.min}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="m-section">
          <div className="m-section-title">
            <span>Đơn gần đây</span>
            <em>Hôm nay</em>
          </div>
          <div className="m-card">
            {orders.length === 0 && (
              <div style={{ padding: 16, color: 'var(--ink-3)', textAlign: 'center', fontSize: 13 }}>Chưa có đơn nào</div>
            )}
            {orders.map((o) => (
              <div key={o.id} className="m-order">
                <div>
                  <b>{shortOrderId(o.id)}</b>
                  <div className="sub">
                    <span>{o.time}</span><span className="dot" />
                    <span>{o.items} món</span><span className="dot" />
                    <span>{o.customer}</span>
                  </div>
                </div>
                <div className="right">
                  <b>{fmt(o.total)}₫</b>
                  <span>{o.method}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
