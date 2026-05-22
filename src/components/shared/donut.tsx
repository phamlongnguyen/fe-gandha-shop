import { fmt } from '@/lib/format';

interface DonutSegment {
  label: string;
  value: number;
  color: string;
}

interface DonutProps {
  data: DonutSegment[];
  size?: number;
  thick?: number;
}

export default function Donut({ data, size = 140, thick = 18 }: DonutProps) {
  const total = data.reduce((s, d) => s + d.value, 0);
  const r = size / 2 - thick / 2;
  const C = 2 * Math.PI * r;
  let acc = 0;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--line)" strokeWidth={thick} />
      {data.map((d, i) => {
        const len = (d.value / total) * C;
        const seg = (
          <circle
            key={i}
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={d.color}
            strokeWidth={thick}
            strokeDasharray={`${len} ${C - len}`}
            strokeDashoffset={-acc}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            strokeLinecap="butt"
          />
        );
        acc += len;
        return seg;
      })}
      <text
        x={size / 2}
        y={size / 2 - 2}
        textAnchor="middle"
        fontWeight="600"
        fontSize="14"
        fill="var(--ink-1)"
      >
        {fmt(total)}
      </text>
      <text x={size / 2} y={size / 2 + 14} textAnchor="middle" fontSize="9" fill="var(--ink-3)" letterSpacing="0.5">
        ĐƠN VỊ NGHÌN ₫
      </text>
    </svg>
  );
}
