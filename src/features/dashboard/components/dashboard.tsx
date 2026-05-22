import { I } from '@/components/icons';
import PageHead from '@/components/shared/page-head';
import Stat from '@/components/shared/stat';
import RevChart from '@/components/shared/rev-chart';
import Donut from '@/components/shared/donut';
import { useCategories } from '@/features/categories/hooks/use-categories';
import { useProducts } from '@/features/inventory/hooks/use-products';
import { shortOrderId, useOrders } from '@/features/orders/hooks/use-orders';
import { REV_14 } from '@/mocks/revenue';
import { fmt } from '@/lib/format';
import type { Route } from '@/app/routes';

interface DashboardProps {
  onNav: (route: Route) => void;
}

export default function Dashboard({ onNav }: DashboardProps) {
  const { data: categories = [] } = useCategories();
  const { data: products = [] } = useProducts();
  const { data: orders = [] } = useOrders({ limit: 50 });

  const todayOrders = orders.filter((o) => o.time.startsWith('Hôm nay'));
  const todayRevenue = todayOrders.reduce((s, o) => s + o.total, 0);
  const avgOrder = todayOrders.length > 0 ? Math.round(todayRevenue / todayOrders.length) : 0;
  const lowStock = products.filter((p) => !p.service && p.stock <= p.min);

  return (
    <div className="page">
      <PageHead
        title="Tổng quan"
        subtitle={new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })}
        actions={
          <>
            <button className="btn ghost">
              <I.download size={14} /> Xuất báo cáo
            </button>
            <button className="btn primary" onClick={() => onNav('pos')}>
              <I.pos size={14} /> Mở bán hàng
            </button>
          </>
        }
      />

      <div className="grid-stats">
        <Stat label="Doanh thu hôm nay" value={<>{fmt(todayRevenue)}<i>₫</i></>} sub={`${todayOrders.length} đơn`} icon={<I.cash size={14} />} accent="orange" />
        <Stat label="Lợi nhuận hôm nay" value={<>—<i>₫</i></>} sub="Cần BE bổ sung view" icon={<I.analytics size={14} />} accent="green" />
        <Stat label="Đơn hàng hôm nay" value={String(todayOrders.length)} sub={`TB ${fmt(avgOrder)}₫/đơn`} icon={<I.orders size={14} />} />
        <Stat label="Tồn kho cảnh báo" value={String(lowStock.length)} sub="dưới mức tối thiểu" icon={<I.warning size={14} />} accent="red" />
      </div>

      <div className="grid-2-1">
        <div className="card">
          <div className="card-head">
            <div>
              <div className="card-title">Doanh thu 14 ngày</div>
              <div className="card-sub">Cột đậm: lợi nhuận · Cột nhạt: doanh thu (nghìn ₫) · (mock)</div>
            </div>
            <div className="legend">
              <span className="lg-dot" style={{ background: 'var(--accent)' }} /> Lợi nhuận
              <span className="lg-dot" style={{ background: 'var(--accent)', opacity: 0.25 }} /> Doanh thu
            </div>
          </div>
          <RevChart data={REV_14} />
        </div>

        <div className="card">
          <div className="card-head">
            <div className="card-title">Cơ cấu doanh thu theo nhóm <span className="card-sub">(mock)</span></div>
          </div>
          <div className="donut-wrap">
            <Donut
              data={[
                { label: 'VPP', value: 980, color: '#FF6B1A' },
                { label: 'Photo', value: 720, color: '#FB923C' },
                { label: 'Giày', value: 840, color: '#0EA5E9' },
                { label: 'Túi', value: 446, color: '#10B981' },
              ]}
            />
            <div className="donut-legend">
              {[
                { label: 'Văn phòng phẩm', value: 980, pct: 33, color: '#FF6B1A' },
                { label: 'Photocopy & In', value: 720, pct: 24, color: '#FB923C' },
                { label: 'Giày dép', value: 840, pct: 28, color: '#0EA5E9' },
                { label: 'Túi xách', value: 446, pct: 15, color: '#10B981' },
              ].map((d) => (
                <div key={d.label} className="dl-row">
                  <span className="dl-dot" style={{ background: d.color }} />
                  <span className="dl-label">{d.label}</span>
                  <span className="dl-val">{fmt(d.value)}k</span>
                  <span className="dl-pct">{d.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid-2-1">
        <div className="card">
          <div className="card-head">
            <div className="card-title">Đơn hàng gần đây</div>
            <button className="link" onClick={() => onNav('orders')}>
              Xem tất cả <I.arrowRight size={12} />
            </button>
          </div>
          <table className="tbl">
            <thead>
              <tr>
                <th>Đơn</th><th>Khách</th><th>SP</th><th className="r">Tổng</th><th>Phương thức</th>
              </tr>
            </thead>
            <tbody>
              {orders.slice(0, 6).map((o) => (
                <tr key={o.id}>
                  <td><b>{shortOrderId(o.id)}</b><span className="td-sub">{o.time}</span></td>
                  <td>{o.customer}</td>
                  <td>{o.items}</td>
                  <td className="r mono">{fmt(o.total)}₫</td>
                  <td><span className="meth">{o.method}</span></td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: 24, color: 'var(--ink-3)' }}>Chưa có đơn nào</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="card">
          <div className="card-head">
            <div className="card-title">Cảnh báo tồn kho</div>
            <button className="link" onClick={() => onNav('inventory')}>
              Quản lý kho <I.arrowRight size={12} />
            </button>
          </div>
          <div className="lowstock">
            {lowStock.length === 0 ? (
              <div style={{ padding: 16, color: 'var(--ink-3)', fontSize: 13 }}>
                Không có cảnh báo. (Cần BE thêm cột <code>min_stock</code> để theo dõi chính xác.)
              </div>
            ) : (
              lowStock.map((p) => (
                <div key={p.id} className="lowstock-row">
                  <div className="ls-cat">{categories.find((c) => c.id === p.cat)?.icon}</div>
                  <div className="ls-name">
                    <b>{p.name}</b>
                    <span>SKU {p.sku}</span>
                  </div>
                  <div className="ls-bar">
                    <div
                      className="ls-bar-fill"
                      style={{
                        width: `${Math.min(100, p.min > 0 ? (p.stock / p.min) * 100 : 0)}%`,
                        background: p.stock < p.min * 0.5 ? '#dc2626' : '#f59e0b',
                      }}
                    />
                  </div>
                  <div className="ls-stock">
                    <b>{p.stock}</b>
                    <span>
                      / {p.min} {p.unit}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
          <button className="btn ghost full" onClick={() => onNav('purchase')}>
            ＋ Tạo đơn nhập hàng
          </button>
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <div className="card-title">Top sản phẩm bán chạy 30 ngày <span className="card-sub">(cần BE bổ sung view)</span></div>
        </div>
        <div className="topgrid">
          {[...products]
            .sort((a, b) => b.sold30 - a.sold30)
            .slice(0, 6)
            .map((p, i) => (
              <div key={p.id} className="top-item">
                <div className="top-rank">#{i + 1}</div>
                <div className="top-cat">{categories.find((c) => c.id === p.cat)?.icon}</div>
                <div className="top-meta">
                  <b>{p.name}</b>
                  <span>
                    Đã bán {p.sold30} {p.unit} · LN {fmt((p.price - p.cost) * p.sold30)}₫
                  </span>
                </div>
                <div className="top-rev">
                  {fmt((p.price * p.sold30) / 1000)}<i>k</i>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
