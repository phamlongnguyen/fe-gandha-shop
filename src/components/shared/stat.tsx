import type { ReactNode } from 'react';
import { I } from '@/components/icons';

interface StatProps {
  label: string;
  value: ReactNode;
  sub?: string;
  delta?: number;
  icon?: ReactNode;
  accent?: 'orange' | 'green' | 'red';
}

export default function Stat({ label, value, sub, delta, icon, accent }: StatProps) {
  const up = delta != null && delta > 0;
  return (
    <div className="card stat">
      <div className="stat-head">
        <span className="stat-lbl">{label}</span>
        {icon && <span className={`stat-ic ${accent ?? ''}`}>{icon}</span>}
      </div>
      <div className="stat-val">{value}</div>
      <div className="stat-foot">
        {delta != null && (
          <span className={`chip ${up ? 'up' : 'dn'}`}>
            {up ? <I.arrowUp size={11} sw={2.4} /> : <I.arrowDown size={11} sw={2.4} />}
            {Math.abs(delta)}%
          </span>
        )}
        {sub && <span className="stat-sub">{sub}</span>}
      </div>
    </div>
  );
}
