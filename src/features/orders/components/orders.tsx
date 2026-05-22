import { useState } from 'react';
import { I } from '@/components/icons';
import PageHead from '@/components/shared/page-head';
import Tabs from '@/components/shared/tabs';
import { shortOrderId, useOrders } from '@/features/orders/hooks/use-orders';
import { fmt } from '@/lib/format';

type OrderTab = 'all' | 'today' | 'cash' | 'qr';

export default function Orders() {
  const [tab, setTab] = useState<OrderTab>('all');
  const { data: orders = [], isLoading } = useOrders({ limit: 100 });

  const filtered = orders.filter((o) =>
    tab === 'all'
      ? true
      : tab === 'today'
        ? o.time.includes('Hôm nay')
        : tab === 'cash'
          ? o.method === 'Tiền mặt'
          : o.method.includes('QR') || o.method.includes('Chuyển'),
  );

  return (
    <div className="page">
      <PageHead
        title="Lịch sử đơn hàng"
        subtitle={isLoading ? 'Đang tải…' : `${orders.length} đơn gần nhất`}
        actions={
          <button className="btn ghost">
            <I.download size={14} /> Xuất Excel
          </button>
        }
      />
      <Tabs<OrderTab>
        value={tab}
        onChange={setTab}
        items={[
          { value: 'all', label: 'Tất cả', count: orders.length },
          { value: 'today', label: 'Hôm nay', count: orders.filter((o) => o.time.includes('Hôm nay')).length },
          { value: 'cash', label: 'Tiền mặt', count: orders.filter((o) => o.method === 'Tiền mặt').length },
          {
            value: 'qr',
            label: 'QR / Chuyển khoản',
            count: orders.filter((o) => o.method.includes('QR') || o.method.includes('Chuyển')).length,
          },
        ]}
      />
      <div className="card">
        <table className="tbl">
          <thead>
            <tr>
              <th>Mã đơn</th>
              <th>Thời gian</th>
              <th>Khách</th>
              <th>SP</th>
              <th className="r">Tổng</th>
              <th className="r">Lợi nhuận</th>
              <th>Phương thức</th>
              <th>Nhân viên</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((o) => (
              <tr key={o.id}>
                <td><b>{shortOrderId(o.id)}</b></td>
                <td>{o.time}</td>
                <td>{o.customer}</td>
                <td>{o.items}</td>
                <td className="r mono"><b>{fmt(o.total)}₫</b></td>
                <td className="r mono up">{fmt(o.profit)}₫</td>
                <td><span className="meth">{o.method}</span></td>
                <td><span className="staff-chip">{o.staff}</span></td>
                <td>
                  <button className="iconbtn sm">
                    <I.more size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
