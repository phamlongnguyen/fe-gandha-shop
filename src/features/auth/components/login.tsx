import { useState, type FormEvent } from 'react';
import { I } from '@/components/icons';
import { useSignIn } from '@/lib/auth';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const signIn = useSignIn();

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    signIn.mutate({ email, password });
  };

  return (
    <div className="login-wrap">
      <form className="login-card" onSubmit={onSubmit}>
        <div className="login-brand">
          <div className="login-logo">G</div>
          <div>
            <div className="login-title">Gandha Shop</div>
            <div className="login-sub">Đăng nhập để vào hệ thống</div>
          </div>
        </div>

        <label className="login-field">
          <span>Email</span>
          <input
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="me@gandha.shop"
            disabled={signIn.isPending}
          />
        </label>

        <label className="login-field">
          <span>Mật khẩu</span>
          <input
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            disabled={signIn.isPending}
          />
        </label>

        {signIn.error && (
          <div className="login-error">
            <I.warning size={14} />
            {mapError(signIn.error)}
          </div>
        )}

        <button type="submit" className="btn primary login-submit" disabled={signIn.isPending}>
          {signIn.isPending ? 'Đang đăng nhập…' : 'Đăng nhập'}
        </button>

        <div className="login-hint">
          Chưa có tài khoản? Liên hệ chủ shop để được cấp.
        </div>
      </form>
    </div>
  );
}

function mapError(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err);
  if (msg.includes('Invalid login credentials')) return 'Email hoặc mật khẩu không đúng';
  if (msg.includes('Email not confirmed')) return 'Email chưa được xác nhận. Liên hệ chủ shop.';
  return msg;
}
