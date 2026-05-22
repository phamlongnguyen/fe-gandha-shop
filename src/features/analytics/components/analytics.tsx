import { I } from '@/components/icons';
import PageHead from '@/components/shared/page-head';
import Stat from '@/components/shared/stat';
import RevChart from '@/components/shared/rev-chart';
import { CATEGORIES } from '@/mocks/categories';
import { PRODUCTS } from '@/mocks/products';
import { REV_14 } from '@/mocks/revenue';
import { fmt } from '@/lib/format';

export default function Analytics() {
  const totalRev = REV_14.reduce((s, d) => s + d.rev, 0) * 1000;
  const totalProfit = REV_14.reduce((s, d) => s + d.profit, 0) * 1000;
  const totalCost = REV_14.reduce((s, d) => s + d.cost, 0) * 1000;
  const margin = ((totalProfit / totalRev) * 100).toFixed(1);

  const catRows = [
    { cat: 'Văn phòng phẩm', rev: 9_840_000, cost: 5_120_000 },
    { cat: 'Photocopy & In', rev: 7_240_000, cost: 2_180_000 },
    { cat: 'Giày dép', rev: 8_450_000, cost: 5_240_000 },
    { cat: 'Túi xách', rev: 4_460_000, cost: 2_580_000 },
  ];

  return (
    <div className="page">
      <PageHead
        title="Phân tích lợi nhuận"
        subtitle="14 ngày · 13/04 → 26/04/2026"
        actions={
          <>
            <select className="btn ghost compact" defaultValue="14d">
              <option value="7d">7 ngày</option>
              <option value="14d">14 ngày</option>
              <option value="30d">30 ngày</option>
              <option value="90d">90 ngày</option>
            </select>
            <button className="btn ghost">
              <I.download size={14} /> Xuất PDF
            </button>
          </>
        }
      />
      <div className="grid-stats">
        <Stat label="Doanh thu" value={<>{fmt(totalRev)}<i>₫</i></>} delta={14} sub="14 ngày qua" accent="orange" icon={<I.cash size={14} />} />
        <Stat label="Giá vốn (COGS)" value={<>{fmt(totalCost)}<i>₫</i></>} delta={11} sub="hàng + dịch vụ" icon={<I.purchase size={14} />} />
        <Stat label="Lợi nhuận gộp" value={<>{fmt(totalProfit)}<i>₫</i></>} delta={16} sub={`biên ${margin}%`} accent="green" icon={<I.analytics size={14} />} />
        <Stat label="Tăng trưởng tuần" value="+18.4%" delta={6} sub="so với tuần trước" accent="orange" icon={<I.arrowUp size={14} />} />
      </div>

      <div className="card">
        <div className="card-head">
          <div className="card-title">Doanh thu vs Lợi nhuận theo ngày</div>
          <div className="legend">
            <span className="lg-dot" style={{ background: 'var(--accent)' }} /> Lợi nhuận
            <span className="lg-dot" style={{ background: 'var(--accent)', opacity: 0.25 }} /> Doanh thu
          </div>
        </div>
        <RevChart data={REV_14} height={260} />
      </div>

      <div className="grid-2-1">
        <div className="card">
          <div className="card-head">
            <div className="card-title">Lợi nhuận theo nhóm hàng</div>
          </div>
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
              {catRows.map((r) => {
                const profit = r.rev - r.cost;
                const m = ((profit / r.rev) * 100).toFixed(1);
                return (
                  <tr key={r.cat}>
                    <td><b>{r.cat}</b></td>
                    <td className="r mono">{fmt(r.rev)}₫</td>
                    <td className="r mono">{fmt(r.cost)}₫</td>
                    <td className="r mono up"><b>{fmt(profit)}₫</b></td>
                    <td className="r mono up">{m}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="card">
          <div className="card-head">
            <div className="card-title">Top sản phẩm theo lợi nhuận</div>
          </div>
          <div className="rank">
            {[...PRODUCTS]
              .sort((a, b) => (b.price - b.cost) * b.sold30 - (a.price - a.cost) * a.sold30)
              .slice(0, 7)
              .map((p, i) => {
                const profit = (p.price - p.cost) * p.sold30;
                const max = (PRODUCTS[0].price - PRODUCTS[0].cost) * PRODUCTS[0].sold30;
                return (
                  <div key={p.id} className="rank-row">
                    <span className="r-i">#{i + 1}</span>
                    <span className="r-cat">{CATEGORIES.find((c) => c.id === p.cat)?.icon}</span>
                    <span className="r-name">{p.name}</span>
                    <span className="r-bar">
                      <span className="r-bar-fill" style={{ width: `${Math.min(100, (profit / max) * 100)}%` }} />
                    </span>
                    <b>{fmt(profit)}₫</b>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
}
