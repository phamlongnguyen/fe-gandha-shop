import { useState } from 'react';
import type { ReactElement } from 'react';
import { I } from '@/components/icons';

export type ToastKind = 'ok' | 'warn';
export type ToastPush = (msg: string, kind?: ToastKind) => void;

interface ToastItem {
  id: string;
  msg: string;
  kind: ToastKind;
}

export function useToasts(): [ToastPush, () => ReactElement] {
  const [list, setList] = useState<ToastItem[]>([]);

  const push: ToastPush = (msg, kind = 'ok') => {
    const id = Math.random().toString(36).slice(2);
    setList((l) => [...l, { id, msg, kind }]);
    setTimeout(() => setList((l) => l.filter((t) => t.id !== id)), 2400);
  };

  const Toaster = () => (
    <div className="toaster">
      {list.map((t) => (
        <div key={t.id} className={`toast ${t.kind}`}>
          {t.kind === 'ok' && <I.check size={14} />}
          {t.kind === 'warn' && <I.warning size={14} />}
          {t.msg}
        </div>
      ))}
    </div>
  );

  return [push, Toaster];
}
