const NUMBER_FORMATTER = new Intl.NumberFormat('vi-VN');

export function fmt(n: number): string {
  return NUMBER_FORMATTER.format(n);
}

export function makeSku(cat: string, n: number): string {
  return `GD-${cat.toUpperCase()}-${String(n).padStart(4, '0')}`;
}
