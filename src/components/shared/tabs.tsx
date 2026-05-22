export interface TabItem<T extends string> {
  value: T;
  label: string;
  count?: number;
}

interface TabsProps<T extends string> {
  value: T;
  onChange: (value: T) => void;
  items: TabItem<T>[];
}

export default function Tabs<T extends string>({ value, onChange, items }: TabsProps<T>) {
  return (
    <div className="tabs">
      {items.map((it) => (
        <button key={it.value} className={`tab ${value === it.value ? 'on' : ''}`} onClick={() => onChange(it.value)}>
          {it.label}
          {it.count != null && <em>{it.count}</em>}
        </button>
      ))}
    </div>
  );
}
