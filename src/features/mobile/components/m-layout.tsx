import { useCallback, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import MTabBar from './m-tabbar';
import MScanner from './m-scanner';
import MHome from './m-home';
import MSell from './m-sell';
import MStock from './m-stock';
import MBuy from './m-buy';
import MMe from './m-me';
import { useMToasts } from './m-toaster';
import type { CartItem, Product } from '@/types';

interface MLayoutProps {
  dark: boolean;
  setDark: (v: boolean) => void;
  hue: number;
  setHue: (v: number) => void;
}

type Tab = 'home' | 'sell' | 'stock' | 'buy' | 'me';

export default function MLayout({ dark, setDark, hue, setHue }: MLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [toast, Toaster] = useMToasts();

  // Cart state lifted so it survives tab navigation
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scannerMode, setScannerMode] = useState<'sell' | 'buy'>('sell');
  const [scannedForBuy, setScannedForBuy] = useState<Product | null>(null);

  const totalQty = cart.reduce((s, x) => s + x.qty, 0);

  const seg = location.pathname.replace(/^\/m\/?/, '').split('/')[0];
  const tab: Tab = (seg === '' ? 'home' : seg) as Tab;

  const openScanner = useCallback(() => {
    setScannerMode(tab === 'buy' ? 'buy' : 'sell');
    setScannerOpen(true);
  }, [tab]);

  const handleScan = useCallback(
    (p: Product) => {
      if (scannerMode === 'sell') {
        if (tab !== 'sell') navigate('/m/sell');
        setCart((c) => {
          const i = c.findIndex((x) => x.id === p.id);
          if (i >= 0) {
            const n = [...c];
            n[i] = { ...n[i], qty: n[i].qty + 1 };
            return n;
          }
          return [...c, { ...p, qty: 1 }];
        });
        toast(`Đã thêm: ${p.name}`);
      } else {
        if (tab !== 'buy') navigate('/m/buy');
        setScannedForBuy(p);
      }
    },
    [navigate, tab, scannerMode, toast],
  );

  const screen = (() => {
    switch (tab) {
      case 'home':
        return <MHome onScanReq={openScanner} />;
      case 'sell':
        return (
          <MSell
            cart={cart}
            setCart={setCart}
            customerId={customerId}
            setCustomerId={setCustomerId}
            toast={toast}
            onScanReq={openScanner}
          />
        );
      case 'stock':
        return <MStock onScanReq={openScanner} />;
      case 'buy':
        return (
          <MBuy
            toast={toast}
            onScanReq={openScanner}
            scannedItem={scannedForBuy}
            clearScannedItem={() => setScannedForBuy(null)}
          />
        );
      case 'me':
        return <MMe dark={dark} setDark={setDark} hue={hue} setHue={setHue} />;
      default:
        return <MHome onScanReq={openScanner} />;
    }
  })();

  return (
    <div className="m-app">
      {screen}
      <MTabBar cartCount={totalQty} onScanReq={openScanner} />
      {scannerOpen && (
        <MScanner mode={scannerMode} onScan={handleScan} onClose={() => setScannerOpen(false)} />
      )}
      <Toaster />
    </div>
  );
}
