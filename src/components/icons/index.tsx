import type { ReactNode } from 'react';

interface IconBaseProps {
  size?: number;
  sw?: number;
  fill?: string;
}

interface IcProps extends IconBaseProps {
  d: string | ReactNode;
}

const Ic = ({ d, size = 18, sw = 1.6, fill = 'none' }: IcProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={fill}
    stroke="currentColor"
    strokeWidth={sw}
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ display: 'block', flexShrink: 0 }}
  >
    {typeof d === 'string' ? <path d={d} /> : d}
  </svg>
);

export type IconProps = IconBaseProps;

export const I = {
  dashboard: (p: IconProps) => <Ic {...p} d={<><rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/></>} />,
  pos: (p: IconProps) => <Ic {...p} d={<><path d="M3 7h18l-1.5 11a2 2 0 0 1-2 1.7H6.5a2 2 0 0 1-2-1.7L3 7Z"/><path d="M8 7V5a4 4 0 0 1 8 0v2"/></>} />,
  inventory: (p: IconProps) => <Ic {...p} d={<><path d="M3 7l9-4 9 4-9 4-9-4Z"/><path d="M3 7v10l9 4 9-4V7"/><path d="M12 11v10"/></>} />,
  purchase: (p: IconProps) => <Ic {...p} d={<><path d="M5 7h14l-1 12H6L5 7Z"/><path d="M9 11V5a3 3 0 0 1 6 0v6"/><path d="M12 14v3"/></>} />,
  promo: (p: IconProps) => <Ic {...p} d={<><path d="M3 13l8-8h8v8l-8 8-8-8Z"/><circle cx="15" cy="9" r="1.2" fill="currentColor"/></>} />,
  analytics: (p: IconProps) => <Ic {...p} d={<><path d="M4 20V10"/><path d="M10 20V4"/><path d="M16 20v-8"/><path d="M22 20H2"/></>} />,
  orders: (p: IconProps) => <Ic {...p} d={<><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M8 9h8M8 13h8M8 17h5"/></>} />,
  customers: (p: IconProps) => <Ic {...p} d={<><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><circle cx="17" cy="9" r="2.5"/><path d="M22 18a4.5 4.5 0 0 0-7-3.7"/></>} />,
  settings: (p: IconProps) => <Ic {...p} d={<><circle cx="12" cy="12" r="3"/><path d="M19.4 14.5a7.7 7.7 0 0 0 0-5l1.7-1.3-2-3.4-2 .8a7.6 7.6 0 0 0-4.3-2.5L12.4 1h-4l-.4 2.1a7.6 7.6 0 0 0-4.3 2.5l-2-.8-2 3.4 1.7 1.3a7.7 7.7 0 0 0 0 5L0 14.8l2 3.4 2-.8a7.6 7.6 0 0 0 4.3 2.5l.4 2.1h4l.4-2.1a7.6 7.6 0 0 0 4.3-2.5l2 .8 2-3.4-1.7-1.3Z"/></>} />,
  qr: (p: IconProps) => <Ic {...p} d={<><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3M20 14v3M14 17v4M17 21h4M14 20h0"/></>} />,
  scan: (p: IconProps) => <Ic {...p} d={<><path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2M3 12h18"/></>} />,
  search: (p: IconProps) => <Ic {...p} d={<><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></>} />,
  bell: (p: IconProps) => <Ic {...p} d={<><path d="M6 8a6 6 0 1 1 12 0c0 5 2 6 2 7H4c0-1 2-2 2-7Z"/><path d="M10 19a2 2 0 0 0 4 0"/></>} />,
  plus: (p: IconProps) => <Ic {...p} d="M12 5v14M5 12h14" />,
  minus: (p: IconProps) => <Ic {...p} d="M5 12h14" />,
  trash: (p: IconProps) => <Ic {...p} d={<><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/></>} />,
  edit: (p: IconProps) => <Ic {...p} d={<><path d="M4 20h4l11-11-4-4L4 16v4Z"/><path d="m14 5 4 4"/></>} />,
  print: (p: IconProps) => <Ic {...p} d={<><path d="M7 9V3h10v6"/><rect x="3" y="9" width="18" height="9" rx="2"/><rect x="7" y="14" width="10" height="6" rx="1"/></>} />,
  download: (p: IconProps) => <Ic {...p} d={<><path d="M12 4v12m0 0-4-4m4 4 4-4M4 20h16"/></>} />,
  check: (p: IconProps) => <Ic {...p} d="M5 12l4 4L19 6" />,
  x: (p: IconProps) => <Ic {...p} d="M6 6l12 12M18 6 6 18" />,
  arrowUp: (p: IconProps) => <Ic {...p} d="M12 19V5m0 0-6 6m6-6 6 6" />,
  arrowDown: (p: IconProps) => <Ic {...p} d="M12 5v14m0 0-6-6m6 6 6-6" />,
  arrowRight: (p: IconProps) => <Ic {...p} d="M5 12h14m0 0-6-6m6 6-6 6" />,
  arrowLeft: (p: IconProps) => <Ic {...p} d="M19 12H5m0 0 6-6m-6 6 6 6" />,
  cash: (p: IconProps) => <Ic {...p} d={<><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="3"/></>} />,
  card: (p: IconProps) => <Ic {...p} d={<><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20M6 15h4"/></>} />,
  warning: (p: IconProps) => <Ic {...p} d={<><path d="M12 3 2 20h20L12 3Z"/><path d="M12 10v5M12 18h0" strokeLinecap="round"/></>} />,
  filter: (p: IconProps) => <Ic {...p} d="M3 5h18M6 12h12M10 19h4" />,
  more: (p: IconProps) => <Ic {...p} d={<><circle cx="5" cy="12" r="1.5" fill="currentColor"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/><circle cx="19" cy="12" r="1.5" fill="currentColor"/></>} />,
  menu: (p: IconProps) => <Ic {...p} d="M4 6h16M4 12h16M4 18h16" />,
  sun: (p: IconProps) => <Ic {...p} d={<><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></>} />,
  moon: (p: IconProps) => <Ic {...p} d="M21 13A9 9 0 1 1 11 3a7 7 0 0 0 10 10Z" />,
  flash: (p: IconProps) => <Ic {...p} d="M13 3 4 14h6l-1 7 9-11h-6l1-7Z" />,
  tag: (p: IconProps) => <Ic {...p} d={<><path d="M3 12V4h8l10 10-8 8L3 12Z"/><circle cx="8" cy="8" r="1.5" fill="currentColor"/></>} />,
  box: (p: IconProps) => <Ic {...p} d={<><path d="M3 7l9-4 9 4-9 4-9-4Z"/><path d="M3 7v10l9 4 9-4V7M12 11v10"/></>} />,
  copy: (p: IconProps) => <Ic {...p} d={<><rect x="8" y="8" width="13" height="13" rx="2"/><path d="M16 8V4a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h4"/></>} />,
  user: (p: IconProps) => <Ic {...p} d={<><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></>} />,
  clock: (p: IconProps) => <Ic {...p} d={<><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>} />,
};
