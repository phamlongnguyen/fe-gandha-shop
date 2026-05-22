import { useState } from 'react';
import { I } from '@/components/icons';
import PageHead from '@/components/shared/page-head';
import Stat from '@/components/shared/stat';
import RevChart from '@/components/shared/rev-chart';
import { useCategoryStats, useRevenueSeries, useTopProducts } from '@/features/analytics/hooks/use-analytics';
import { useCategories } from '@/features/categories/hooks/use-categories';
import { fmt } from '@/lib/format';

const PERIOD_OPTIONS = [
  { value: 7, label: '7 ngày' },
  { value: 14, label: '14 ngày' },
  { value: 30, label: '30 ngày' },
  { value: 90, label: '90 ngày' },
];

const CAT_COLORS = ['#FF6B1A', '#FB923C', '#0EA5E9', '#10B981', '#A855F7', '#F59E0B'];

export default function Analytics() {
  const [days, setDays] = useState(14);
  const { data: series = [] } = useRevenueSeries(days);
  const { data: catStats = [] } = useCategoryStats(days);
  const { data: topProducts = [] } = useTopProducts(days, 'profit', 7);
  const { data: categories = [] } = useCategories();

  const totalRev = catStats.reduce((s, c) => s + c.revenue, 0);
  const totalCost = catStats.reduce((s, c) => s + c.cost, 0);
  const totalProfit = catStats.reduce((s, c) => s + c.profit, 0);
  const margin = totalRev > 0 ? ((totalProfit / totalRev) * 100).toFixed(1) : '0';

  const fromDate = new Date(Date.now() - days * 86_400_000)
    .toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const toDate = new Date().toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });

  const maxProfit = topProducts[0]?.profit ?? 1;

  return (
    <div className="page">
      <PageHead
        title="Phân tích lợi nhuận"
        subtitle={`${days} ngày · ${fromDate} → ${toDate}`}
        actions={
          <>
            <select
              className="btn ghost compact"
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
            >
              {PERIOD_OPTIONS.map((o) => (<option key={o.value} value={o.value}>{o.label}</option>))}
            </select>
            <button className="btn ghost"><I.download size={14} /> Xuất PDF</button>
          </>
        }
      />

      <div className="grid-stats">
        <Stat label="Doanh thu" value={<>{fmt(totalRev)}<i>₫</i></>} sub={`${days} ngày qua`} accent="orange" icon={<I.cash size={14} />} />
        <Stat label="Giá vốn (COGS)" value={<>{fmt(totalCost)}<i>₫</i></>} sub="hàng + dịch vụ" icon={<I.purchase size={14} />} />
        <Stat label="Lợi nhuận gộp" value={<>{fmt(totalProfit)}<i>₫</i></>} sub={`biên ${margin}%`} accent="green" icon={<I.analytics size={14} />} />
        <Stat label="Số ngày có dữ liệu" value={String(series.length)} sub={`trong ${days} ngày`} icon={<I.clock size={14} />} />
      </div>

      <div className="card">
        <div className="card-head">
          <div className="card-title">Doanh thu vs Lợi nhuận theo ngày</div>
          <div className="legend">
            <span className="lg-dot" style={{ background: 'var(--accent)' }} /> Lợi nhuận
            <span className="lg-dot" style={{ background: 'var(--accent)', opacity: 0.25 }} /> Doanh thu
          </div>
        </div>
        {series.length > 0
          ? <RevChart data={series} height={260} />
          : <div style={{ padding: 32, textAlign: 'center', color: 'var(--ink-3)' }}>Chưa có dữ liệu cho kỳ này</div>
        }
      </div>

      <div className="grid-2-1">
        <div className="card">
          <div className="card-head"><div className="card-title">Lợi nhuận theo nhóm hàng</div></div>
          <table className="tbl">
            <thead>
              <tr>
                <th>Nhóm</th>
                <th className="r">Doanh thu</th>
                <th className="r">Vốn</th>
                <th className="r">LN gộp</th>
                <th className="r">Biên</th>
              </tr>
            </thead>
            <tbody>
              {catStats.map((r) => {
                const m = r.revenue > 0 ? ((r.profit / r.revenue) * 100).toFixed(1) : '0';
                const icon = categories.find((c) => c.id === r.category_slug)?.icon;
                return (
                  <tr key={r.category_id}>
                    <td><b>{icon} {r.category_name}</b></td>
                    <td className="r mono">{fmt(r.revenue)}₫</td>
                    <td className="r mono">{fmt(r.cost)}₫</td>
                    <td className="r mono up"><b>{fmt(r.profit)}₫</b></td>
                    <td className="r mono up">{m}%</td>
                  </tr>
                );
              })}
              {catStats.length === 0 && (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: 24, color: 'var(--ink-3)' }}>Chưa có dữ liệu</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="card">
          <div className="card-head"><div className="card-title">Top sản phẩm theo lợi nhuận</div></div>
          <div className="rank">
            {topProducts.map((p, i) => (
              <div key={p.id} className="rank-row">
                <span className="r-i">#{i + 1}</span>
                <span className="r-cat">{categories.find((c) => p.sku?.startsWith(`GD-${c.id.toUpperCase()}`) || c.id)?.icon ?? '•'}</span>
                <span className="r-name">{p.name}</span>
                <span className="r-bar">
                  <span className="r-bar-fill" style={{
                    width: `${Math.min(100, (p.profit / maxProfit) * 100)}%`,
                    background: CAT_COLORS[i % CAT_COLORS.length],
                  }} />
                </span>
                <b>{fmt(p.profit)}₫</b>
              </div>
            ))}
            {topProducts.length === 0 && (
              <div style={{ padding: 24, textAlign: 'center', color: 'var(--ink-3)' }}>Chưa có dữ liệu</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
