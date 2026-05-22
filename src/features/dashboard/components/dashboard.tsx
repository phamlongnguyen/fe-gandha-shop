import { useNavigate } from 'react-router-dom';
import { I } from '@/components/icons';
import PageHead from '@/components/shared/page-head';
import Stat from '@/components/shared/stat';
import RevChart from '@/components/shared/rev-chart';
import Donut from '@/components/shared/donut';
import { useCategories } from '@/features/categories/hooks/use-categories';
import { useProducts } from '@/features/inventory/hooks/use-products';
import { shortOrderId, useOrders } from '@/features/orders/hooks/use-orders';
import { useDashboardToday, useCategoryStats, useRevenueSeries, useTopProducts } from '@/features/analytics/hooks/use-analytics';
import { fmt } from '@/lib/format';

const CAT_COLORS = ['#FF6B1A', '#FB923C', '#0EA5E9', '#10B981', '#A855F7'];

export default function Dashboard() {
  const navigate = useNavigate();
  const onNav = (path: string) => navigate(`/${path}`);
  const { data: today } = useDashboardToday();
  const { data: series = [] } = useRevenueSeries(14);
  const { data: catStats = [] } = useCategoryStats(14);
  const { data: topProducts = [] } = useTopProducts(30, 'profit', 6);
  const { data: categories = [] } = useCategories();
  const { data: products = [] } = useProducts();
  const { data: ordersResult } = useOrders({ pageSize: 6 });
  const orders = ordersResult?.rows ?? [];

  const lowStock = products.filter((p) => !p.service && p.stock <= p.min);

  const donutData = catStats.slice(0, 5).map((c, i) => ({
    label: c.category_name,
    value: c.revenue,
    color: CAT_COLORS[i % CAT_COLORS.length],
  }));

  const totalCatRev = catStats.reduce((s, c) => s + c.revenue, 0);

  return (
    <div className="page">
      <PageHead
        title="Tổng quan"
        subtitle={new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })}
        actions={
          <>
            <button className="btn ghost"><I.download size={14} /> Xuất báo cáo</button>
            <button className="btn primary" onClick={() => onNav('pos')}>
              <I.pos size={14} /> Mở bán hàng
            </button>
          </>
        }
      />

      <div className="grid-stats">
        <Stat
          label="Doanh thu hôm nay"
          value={<>{fmt(today?.revenue ?? 0)}<i>₫</i></>}
          delta={today?.vs_yesterday_pct.revenue}
          sub="vs hôm qua"
          icon={<I.cash size={14} />}
          accent="orange"
        />
        <Stat
          label="Lợi nhuận hôm nay"
          value={<>{fmt(today?.profit ?? 0)}<i>₫</i></>}
          delta={today?.vs_yesterday_pct.profit}
          sub={today && today.revenue > 0 ? `biên ${((today.profit / today.revenue) * 100).toFixed(1)}%` : '—'}
          icon={<I.analytics size={14} />}
          accent="green"
        />
        <Stat
          label="Đơn hàng"
          value={String(today?.order_count ?? 0)}
          sub={today?.order_count ? `TB ${fmt(Math.round((today.revenue) / today.order_count))}₫/đơn` : '—'}
          icon={<I.orders size={14} />}
        />
        <Stat
          label="Tồn kho cảnh báo"
          value={String(today?.low_stock_count ?? lowStock.length)}
          sub="dưới mức tối thiểu"
          icon={<I.warning size={14} />}
          accent="red"
        />
      </div>

      <div className="grid-2-1">
        <div className="card">
          <div className="card-head">
            <div>
              <div className="card-title">Doanh thu 14 ngày</div>
              <div className="card-sub">Lợi nhuận · Doanh thu (nghìn ₫)</div>
            </div>
            <div className="legend">
              <span className="lg-dot" style={{ background: 'var(--accent)' }} /> Lợi nhuận
              <span className="lg-dot" style={{ background: 'var(--accent)', opacity: 0.25 }} /> Doanh thu
            </div>
          </div>
          {series.length > 0
            ? <RevChart data={series} />
            : <div style={{ padding: 32, textAlign: 'center', color: 'var(--ink-3)' }}>Chưa có dữ liệu</div>
          }
        </div>

        <div className="card">
          <div className="card-head"><div className="card-title">Cơ cấu doanh thu theo nhóm</div></div>
          <div className="donut-wrap">
            {donutData.length > 0 ? (
              <>
                <Donut data={donutData} />
                <div className="donut-legend">
                  {catStats.slice(0, 5).map((c, i) => {
                    const pct = totalCatRev > 0 ? Math.round((c.revenue / totalCatRev) * 100) : 0;
                    return (
                      <div key={c.category_id} className="dl-row">
                        <span className="dl-dot" style={{ background: CAT_COLORS[i % CAT_COLORS.length] }} />
                        <span className="dl-label">{c.category_name}</span>
                        <span className="dl-val">{fmt(c.revenue / 1000)}k</span>
                        <span className="dl-pct">{pct}%</span>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div style={{ padding: 32, textAlign: 'center', color: 'var(--ink-3)' }}>Chưa có dữ liệu</div>
            )}
          </div>
        </div>
      </div>

      <div className="grid-2-1">
        <div className="card">
          <div className="card-head">
            <div className="card-title">Đơn hàng gần đây</div>
            <button className="link" onClick={() => onNav('orders')}>Xem tất cả <I.arrowRight size={12} /></button>
          </div>
          <table className="tbl">
            <thead>
              <tr><th>Đơn</th><th>Khách</th><th>SP</th><th className="r">Tổng</th><th className="r">LN</th><th>PT</th></tr>
            </thead>
            <tbody>
              {orders.slice(0, 6).map((o) => (
                <tr key={o.id}>
                  <td><b>{shortOrderId(o.id)}</b><span className="td-sub">{o.time}</span></td>
                  <td>{o.customer}</td>
                  <td>{o.items}</td>
                  <td className="r mono">{fmt(o.total)}₫</td>
                  <td className="r mono up">{fmt(o.profit)}₫</td>
                  <td><span className="meth">{o.method}</span></td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: 24, color: 'var(--ink-3)' }}>Chưa có đơn nào</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="card">
          <div className="card-head">
            <div className="card-title">Cảnh báo tồn kho</div>
            <button className="link" onClick={() => onNav('inventory')}>Quản lý kho <I.arrowRight size={12} /></button>
          </div>
          <div className="lowstock">
            {lowStock.length === 0 ? (
              <div style={{ padding: 16, color: 'var(--ink-3)', fontSize: 13 }}>
                {products.length === 0 ? 'Đang tải…' : 'Không có cảnh báo tồn kho.'}
              </div>
            ) : (
              lowStock.map((p) => (
                <div key={p.id} className="lowstock-row">
                  <div className="ls-cat">{categories.find((c) => c.id === p.cat)?.icon}</div>
                  <div className="ls-name"><b>{p.name}</b><span>SKU {p.sku}</span></div>
                  <div className="ls-bar">
                    <div className="ls-bar-fill" style={{
                      width: `${Math.min(100, p.min > 0 ? (p.stock / p.min) * 100 : 0)}%`,
                      background: p.stock < p.min * 0.5 ? '#dc2626' : '#f59e0b',
                    }} />
                  </div>
                  <div className="ls-stock"><b>{p.stock}</b><span>/ {p.min} {p.unit}</span></div>
                </div>
              ))
            )}
          </div>
          <button className="btn ghost full" onClick={() => onNav('purchase')}>＋ Tạo đơn nhập hàng</button>
        </div>
      </div>

      <div className="card">
        <div className="card-head"><div className="card-title">Top sản phẩm bán chạy 30 ngày</div></div>
        <div className="topgrid">
          {topProducts.map((p, i) => (
            <div key={p.id} className="top-item">
              <div className="top-rank">#{i + 1}</div>
              <div className="top-cat">•</div>
              <div className="top-meta">
                <b>{p.name}</b>
                <span>Đã bán {p.qty_sold} {p.unit} · LN {fmt(p.profit)}₫</span>
              </div>
              <div className="top-rev">{fmt(p.revenue / 1000)}<i>k</i></div>
            </div>
          ))}
          {topProducts.length === 0 && products.length > 0 && (
            <div style={{ padding: 16, color: 'var(--ink-3)', gridColumn: '1/-1' }}>Chưa có đơn hàng nào để phân tích.</div>
          )}
        </div>
      </div>
    </div>
  );
}
