import { useEffect, useState } from 'react';
import { I } from '@/components/icons';
import PageHead from '@/components/shared/page-head';
import Pagination from '@/components/shared/pagination';
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

const PAGE_SIZE = 24;

function initial(name: string): string {
  const parts = name.trim().split(/\s+/);
  return (parts[parts.length - 1]?.charAt(0) ?? '?').toUpperCase();
}

export default function Customers() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const id = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 250);
    return () => clearTimeout(id);
  }, [search]);

  const { data: result, isLoading } = useCustomers({ page, pageSize: PAGE_SIZE, search: debouncedSearch });
  const customers = result?.rows ?? [];
  const total = result?.total ?? 0;

  return (
    <div className="page">
      <PageHead
        title="Khách hàng"
        subtitle={isLoading ? 'Đang tải…' : `${total} khách quen của tiệm`}
        actions={
          <button className="btn primary">
            <I.plus size={14} /> Thêm khách
          </button>
        }
      />

      <div className="card-head sticky-toolbar" style={{ marginBottom: 12 }}>
        <div className="pos-search w-360">
          <I.search size={15} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên hoặc số điện thoại…"
          />
        </div>
      </div>

      <div className="cust-grid">
        {customers.map((c) => (
          <div key={c.id} className="cust-card">
            <div className="cust-head">
              <div className="cust-avatar" style={{ background: tagColor[c.tag] }}>{initial(c.name)}</div>
              <div>
                <div className="cust-name">{c.name}</div>
                <div className="cust-phone">{c.phone || '—'}</div>
              </div>
              <span className={`pill ${tagPill[c.tag]}`}>{c.tag}</span>
            </div>
            <div className="cust-stats">
              <div><b>{c.orders}</b><span>đơn</span></div>
              <div><b>{fmt(c.spent / 1000)}k</b><span>chi tiêu</span></div>
              <div><b>{c.lastVisit}</b><span>ghé gần nhất</span></div>
            </div>
          </div>
        ))}
        {customers.length === 0 && !isLoading && (
          <div style={{ padding: 24, color: 'var(--ink-3)', gridColumn: '1/-1' }}>Không tìm thấy khách nào.</div>
        )}
      </div>

      <Pagination page={page} pageSize={PAGE_SIZE} total={total} onChange={setPage} />
    </div>
  );
}
