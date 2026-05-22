import type { ReactNode } from 'react';

interface MEmptyProps {
  icon: ReactNode;
  title: string;
  hint?: string;
}

export default function MEmpty({ icon, title, hint }: MEmptyProps) {
  return (
    <div className="m-empty">
      <div className="ic">{icon}</div>
      <div className="t">{title}</div>
      {hint && <div className="h">{hint}</div>}
    </div>
  );
}
