import { useState } from 'react';
import { I } from '@/components/icons';
import PageHead from '@/components/shared/page-head';
import Pagination from '@/components/shared/pagination';
import Tabs from '@/components/shared/tabs';
import { shortOrderId, useOrders } from '@/features/orders/hooks/use-orders';
import { fmt } from '@/lib/format';

type Tab = 'all' | 'cash' | 'qr';

const PAGE_SIZE = 50;

export default function Orders() {
  const [tab, setTab] = useState<Tab>('all');
  const [page, setPage] = useState(1);

  const paymentMethod = tab === 'cash' ? 'cash' : tab === 'qr' ? 'transfer' : undefined;

  const { data: result, isLoading } = useOrders({ page, pageSize: PAGE_SIZE, paymentMethod });
  const orders = result?.rows ?? [];
  const total = result?.total ?? 0;

  const onTabChange = (t: Tab) => { setTab(t); setPage(1); };

  return (
    <div className="page">
      <PageHead
        title="Lịch sử đơn hàng"
        subtitle={isLoading ? 'Đang tải…' : `${total} đơn`}
        actions={
          <button className="btn ghost">
            <I.download size={14} /> Xuất Excel
          </button>
        }
      />
      <Tabs<Tab>
        value={tab}
        onChange={onTabChange}
        items={[
          { value: 'all', label: 'Tất cả' },
          { value: 'cash', label: 'Tiền mặt' },
          { value: 'qr', label: 'Chuyển khoản' },
        ]}
      />
      <div className="card">
        <table className="tbl">
          <thead>
            <tr>
              <th>Mã đơn</th><th>Thời gian</th><th>Khách</th><th>SP</th>
              <th className="r">Tổng</th><th className="r">Lợi nhuận</th>
              <th>Phương thức</th><th>Nhân viên</th><th></th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id}>
                <td><b>{shortOrderId(o.id)}</b></td>
                <td>{o.time}</td>
                <td>{o.customer}</td>
                <td>{o.items}</td>
                <td className="r mono"><b>{fmt(o.total)}₫</b></td>
                <td className="r mono up">{fmt(o.profit)}₫</td>
                <td><span className="meth">{o.method}</span></td>
                <td><span className="staff-chip">{o.staff}</span></td>
                <td><button className="iconbtn sm"><I.more size={14} /></button></td>
              </tr>
            ))}
            {orders.length === 0 && !isLoading && (
              <tr><td colSpan={9} style={{ textAlign: 'center', padding: 32, color: 'var(--ink-3)' }}>Chưa có đơn nào</td></tr>
            )}
          </tbody>
        </table>
        <Pagination page={page} pageSize={PAGE_SIZE} total={total} onChange={setPage} />
      </div>
    </div>
  );
}
