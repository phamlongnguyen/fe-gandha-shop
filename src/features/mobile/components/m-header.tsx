import type { ReactNode } from 'react';

interface MHeaderProps {
  title: string;
  sub?: string;
  accent?: boolean;
  left?: ReactNode;
  right?: ReactNode;
  children?: ReactNode;
}

export default function MHeader({ title, sub, accent = false, left, right, children }: MHeaderProps) {
  return (
    <div className={`m-header ${accent ? 'accent' : ''}`}>
      {left}
      <div style={{ flex: 1, minWidth: 0 }}>
        <h1>{title}</h1>
        {sub && <div className="sub">{sub}</div>}
      </div>
      {right}
      {children}
    </div>
  );
}
