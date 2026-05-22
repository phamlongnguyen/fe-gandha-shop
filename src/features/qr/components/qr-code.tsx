import { useMemo } from 'react';

interface QRCodeProps {
  value: string;
  size?: number;
  scale?: number;
  fg?: string;
  bg?: string;
  logo?: boolean;
}

// QR-style code renderer (deterministic pseudo-random pattern from a seed string).
// Not a real QR — visually convincing for printing/preview at any size.
export default function QRCode({ value, size = 180, scale = 21, fg = '#1B1610', bg = '#fff', logo = false }: QRCodeProps) {
  const grid = useMemo(() => {
    const N = scale;
    let h = 2166136261;
    for (let i = 0; i < value.length; i++) {
      h ^= value.charCodeAt(i);
      h = (h * 16777619) >>> 0;
    }
    const rng = () => {
      h ^= h << 13;
      h >>>= 0;
      h ^= h >>> 17;
      h ^= h << 5;
      h >>>= 0;
      return (h % 1000) / 1000;
    };
    const g: number[][] = Array.from({ length: N }, () => Array(N).fill(0));
    for (let y = 0; y < N; y++) {
      for (let x = 0; x < N; x++) g[y][x] = rng() > 0.5 ? 1 : 0;
    }

    const clear = (r: number, c: number) => {
      for (let dy = 0; dy < 7; dy++) for (let dx = 0; dx < 7; dx++) g[r + dy][c + dx] = 0;
    };
    clear(0, 0);
    clear(0, N - 7);
    clear(N - 7, 0);

    const finder = (r: number, c: number) => {
      for (let dy = 0; dy < 7; dy++) {
        for (let dx = 0; dx < 7; dx++) {
          const onRing = dy === 0 || dy === 6 || dx === 0 || dx === 6;
          const onCore = dy >= 2 && dy <= 4 && dx >= 2 && dx <= 4;
          g[r + dy][c + dx] = onRing || onCore ? 1 : 0;
        }
      }
    };
    finder(0, 0);
    finder(0, N - 7);
    finder(N - 7, 0);

    if (logo) {
      const c0 = Math.floor(N / 2) - 2;
      for (let dy = 0; dy < 5; dy++) for (let dx = 0; dx < 5; dx++) g[c0 + dy][c0 + dx] = 0;
    }
    return g;
  }, [value, scale, logo]);

  const N = scale;
  const cell = size / N;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: 'block', borderRadius: 4 }}>
      <rect width={size} height={size} fill={bg} />
      {grid.map((row, y) =>
        row.map((v, x) =>
          v ? (
            <rect
              key={`${x},${y}`}
              x={x * cell}
              y={y * cell}
              width={cell + 0.4}
              height={cell + 0.4}
              fill={fg}
              rx={cell * 0.18}
            />
          ) : null,
        ),
      )}
      {logo && (
        <g>
          <rect x={size / 2 - 14} y={size / 2 - 14} width={28} height={28} rx={6} fill={bg} />
          <text
            x={size / 2}
            y={size / 2 + 4}
            textAnchor="middle"
            fontSize={14}
            fontWeight={700}
            fill={fg}
            fontFamily="ui-sans-serif,system-ui"
          >
            G
          </text>
        </g>
      )}
    </svg>
  );
}
