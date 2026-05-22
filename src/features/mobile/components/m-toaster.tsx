import { useCallback, useState } from 'react';
import type { ReactElement } from 'react';

interface MToast {
  id: string;
  msg: string;
}

export type MToastPush = (msg: string) => void;

export function useMToasts(): [MToastPush, () => ReactElement] {
  const [list, setList] = useState<MToast[]>([]);

  const push = useCallback<MToastPush>((msg) => {
    const id = Math.random().toString(36).slice(2);
    setList((l) => [...l, { id, msg }]);
    setTimeout(() => setList((l) => l.filter((t) => t.id !== id)), 2200);
  }, []);

  const Toaster = () => (
    <div className="m-toaster">
      {list.map((t) => <div key={t.id} className="m-toast">{t.msg}</div>)}
    </div>
  );

  return [push, Toaster];
}
