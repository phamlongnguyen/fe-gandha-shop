import type { ReactNode } from 'react';

interface PageHeadProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}

export default function PageHead({ title, subtitle, actions }: PageHeadProps) {
  return (
    <div className="pagehead">
      <div>
        <h1 className="pagetitle">{title}</h1>
        {subtitle && <div className="pagesub">{subtitle}</div>}
      </div>
      {actions && <div className="pagehead-actions">{actions}</div>}
    </div>
  );
}
