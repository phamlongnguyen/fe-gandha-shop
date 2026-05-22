import { I } from '@/components/icons';
import PageHead from '@/components/shared/page-head';
import { useCustomers } from '@/features/customers/hooks/use-customers';
import { fmt } from '@/lib/format';
import type { CustomerTag } from '@/types';

const tagColor: Record<CustomerTag, string> = {
  VIP: '#FF6B1A',
  B2B: '#0EA5E9',
  Thân: '#10B981',
  Mới: '#A855F7',
};

const tagPill: Record<CustomerTag, string> = {
  VIP: 'vip',
  B2B: 'b2b',
  Thân: 'ok',
  Mới: 'low',
};

function initial(name: string): string {
  const parts = name.trim().split(/\s+/);
  const last = parts[parts.length - 1] ?? '';
  return last.charAt(0).toUpperCase() || '?';
}

export default function Customers() {
  const { data: customers = [], isLoading } = useCustomers();

  return (
    <div className="page">
      <PageHead
        title="Khách hàng"
        subtitle={isLoading ? 'Đang tải…' : `${customers.length} khách quen của tiệm`}
        actions={
          <button className="btn primary">
            <I.plus size={14} /> Thêm khách
          </button>
        }
      />
      <div className="cust-grid">
        {customers.map((c) => (
          <div key={c.id} className="cust-card">
            <div className="cust-head">
              <div className="cust-avatar" style={{ background: tagColor[c.tag] }}>
                {initial(c.name)}
              </div>
              <div>
                <div className="cust-name">{c.name}</div>
                <div className="cust-phone">{c.phone || '—'}</div>
              </div>
              <span className={`pill ${tagPill[c.tag]}`}>{c.tag}</span>
            </div>
            <div className="cust-stats">
              <div>
                <b>{c.orders}</b>
                <span>đơn</span>
              </div>
              <div>
                <b>{fmt(c.spent / 1000)}k</b>
                <span>chi tiêu</span>
              </div>
              <div>
                <b>{c.lastVisit}</b>
                <span>ghé gần nhất</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
