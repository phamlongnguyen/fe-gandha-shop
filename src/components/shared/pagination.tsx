import { I } from '@/components/icons';

interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onChange: (page: number) => void;
}

function pageList(current: number, last: number): (number | '…')[] {
  if (last <= 7) return Array.from({ length: last }, (_, i) => i + 1);
  const set = new Set<number>([1, last, current - 1, current, current + 1]);
  const arr = [...set].filter((p) => p >= 1 && p <= last).sort((a, b) => a - b);
  const out: (number | '…')[] = [];
  arr.forEach((p, i) => {
    if (i > 0 && p - arr[i - 1] > 1) out.push('…');
    out.push(p);
  });
  return out;
}

export default function Pagination({ page, pageSize, total, onChange }: PaginationProps) {
  if (total === 0) return null;
  const last = Math.max(1, Math.ceil(total / pageSize));
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <div className="pagination">
      <span className="pagination-info">
        {from}–{to} <em>/ {total}</em>
      </span>
      <div className="pagination-controls">
        <button
          className="iconbtn sm"
          onClick={() => onChange(Math.max(1, page - 1))}
          disabled={page <= 1}
          title="Trang trước"
        >
          <I.arrowLeft size={13} />
        </button>
        {pageList(page, last).map((p, i) =>
          p === '…' ? (
            <span key={`e${i}`} className="pagination-ellipsis">…</span>
          ) : (
            <button
              key={p}
              className={`pagination-page ${p === page ? 'on' : ''}`}
              onClick={() => onChange(p)}
            >
              {p}
            </button>
          ),
        )}
        <button
          className="iconbtn sm"
          onClick={() => onChange(Math.min(last, page + 1))}
          disabled={page >= last}
          title="Trang sau"
        >
          <I.arrowRight size={13} />
        </button>
      </div>
    </div>
  );
}
