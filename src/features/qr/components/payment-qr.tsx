import { fmt } from '@/lib/format';
import QRCode from './qr-code';

interface PaymentQRProps {
  amount: number;
  orderId: string;
}

export default function PaymentQR({ amount, orderId }: PaymentQRProps) {
  return (
    <div className="payqr">
      <div className="payqr-head">
        <div className="payqr-bank">VCB</div>
        <div>
          <div className="payqr-title">VietQR · Vietcombank</div>
          <div className="payqr-acc">9704 0612 3456 7890 · GANDHA SHOP</div>
        </div>
      </div>
      <div className="payqr-mid">
        <QRCode value={`VIETQR|${orderId}|${amount}`} size={170} logo fg="#0a1f44" />
      </div>
      <div className="payqr-foot">
        <div>Số tiền</div>
        <div className="payqr-amt">
          {fmt(amount)}
          <span>₫</span>
        </div>
      </div>
      <div className="payqr-ref">
        Nội dung: <b>{orderId}</b>
      </div>
    </div>
  );
}
