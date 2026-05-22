import { useEffect } from 'react';
import type { ReactNode } from 'react';

interface MSheetProps {
  onClose: () => void;
  title?: string;
  sub?: string;
  right?: ReactNode;
  children: ReactNode;
}

export default function MSheet({ onClose, children, title, sub, right }: MSheetProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <>
      <div className="m-sheet-veil" onClick={onClose} />
      <div className="m-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="m-sheet-handle" onClick={onClose}><i /></div>
        {title && (
          <div className="m-sheet-head">
            <div>
              <h2>{title}</h2>
              {sub && <div className="sub">{sub}</div>}
            </div>
            {right}
          </div>
        )}
        {children}
      </div>
    </>
  );
}
