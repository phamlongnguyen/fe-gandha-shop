import type { RevPoint } from '@/types';

interface RevChartProps {
  data: RevPoint[];
  height?: number;
}

export default function RevChart({ data, height = 200 }: RevChartProps) {
  const w = 720;
  const padX = 28;
  const padY = 24;
  const max = Math.max(...data.map((d) => d.rev)) * 1.15;
  const bw = (w - padX * 2) / data.length;
  const yTo = (v: number) => height - padY - (v / max) * (height - padY * 2);

  const linePath = data
    .map((d, i) => {
      const x = padX + i * bw + bw / 2;
      return `${i === 0 ? 'M' : 'L'} ${x} ${yTo(d.profit)}`;
    })
    .join(' ');

  return (
    <svg viewBox={`0 0 ${w} ${height}`} width="100%" height={height} style={{ display: 'block' }}>
      {[0, 0.25, 0.5, 0.75, 1].map((p, i) => (
        <line
          key={i}
          x1={padX}
          x2={w - padX}
          y1={height - padY - p * (height - padY * 2)}
          y2={height - padY - p * (height - padY * 2)}
          stroke="var(--line)"
          strokeDasharray="3 4"
        />
      ))}
      {data.map((d, i) => {
        const x = padX + i * bw + bw * 0.18;
        const bw2 = bw * 0.64;
        const y = yTo(d.rev);
        return (
          <g key={i}>
            <rect x={x} y={y} width={bw2} height={height - padY - y} rx="3" fill="var(--accent)" opacity="0.16" />
            <rect
              x={x}
              y={yTo(d.profit)}
              width={bw2}
              height={height - padY - yTo(d.profit)}
              rx="3"
              fill="var(--accent)"
            />
            <text x={x + bw2 / 2} y={height - padY + 14} fontSize="9" textAnchor="middle" fill="var(--ink-3)">
              {d.d}
            </text>
          </g>
        );
      })}
      <path
        d={linePath}
        fill="none"
        stroke="var(--accent-deep)"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.55"
        strokeDasharray="2 3"
      />
    </svg>
  );
}
