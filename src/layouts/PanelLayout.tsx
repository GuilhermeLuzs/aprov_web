import { Outlet, useNavigate } from 'react-router';
import { LogOut } from 'lucide-react';
import { BrandMark, Container } from '../components';
import { signOut, useCurrentAccount } from '../store/session';
import { icon } from '../theme';
import { PANEL_LABEL } from '../types';

export function PanelLayout() {
  const account = useCurrentAccount();
  const navigate = useNavigate();

  const leave = () => {
    signOut();
    navigate('/login', { replace: true });
  };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-zero z-10 border-b border-border bg-surface">
        <Container width="wide" className="flex h-header items-center justify-between gap-lg">
          <div className="flex items-center gap-sm">
            <BrandMark />
            <span className="hidden font-display font-extrabold text-title text-primary sm:inline">APROV</span>
            {account ? (
              <span className="rounded-pill bg-primary-dim px-md py-xs font-semibold text-caption text-primary">
                {PANEL_LABEL[account.role]}
              </span>
            ) : null}
          </div>
          <div className="flex items-center gap-lg">
            {account ? (
              <span className="hidden truncate font-semibold text-ink md:inline">{account.name}</span>
            ) : null}
            <button
              type="button"
              onClick={leave}
              className="flex h-control items-center gap-sm rounded-pill px-md font-semibold text-ink-muted hover:bg-surface-alt hover:text-ink"
            >
              <LogOut size={icon.size.md} strokeWidth={icon.strokeWidth} aria-hidden />
              Sair
            </button>
          </div>
        </Container>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
