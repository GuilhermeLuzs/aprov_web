import { useCallback, useState } from 'react';
import { Outlet } from 'react-router';
import { Menu } from 'lucide-react';
import { BrandMark, CompanyAvatar } from '../components';
import { useCurrentAccount, useCurrentCompany } from '../store/session';
import { icon } from '../theme';
import { PANEL_LABEL } from '../types';
import { PANEL_DRAWER_ID, PanelSidebar } from './PanelSidebar';

export function PanelLayout() {
  const account = useCurrentAccount();
  const company = useCurrentCompany();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-zero z-10 border-b border-border bg-surface">
        <div className="flex h-header items-center justify-between gap-lg px-lg lg:px-xxl">
          <div className="flex min-w-zero items-center gap-sm">
            {account ? (
              <button
                type="button"
                onClick={() => setDrawerOpen(true)}
                aria-label="Abrir menu"
                aria-expanded={drawerOpen}
                aria-controls={PANEL_DRAWER_ID}
                className="flex h-control w-control items-center justify-center rounded-pill text-ink hover:bg-surface-alt lg:hidden"
              >
                <Menu size={icon.size.lg} strokeWidth={icon.strokeWidth} aria-hidden />
              </button>
            ) : null}
            <BrandMark />
            <span className="font-display font-extrabold text-title text-primary">APROV</span>
            {account ? (
              <span className="min-w-zero truncate font-semibold text-caption text-ink-muted">
                {PANEL_LABEL[account.role]}
              </span>
            ) : null}
          </div>
          {account ? (
            <div className="flex min-w-zero items-center gap-md">
              <span className="hidden truncate font-semibold text-ink md:inline">{account.name}</span>
              <div className="shrink-0">
                <CompanyAvatar name={account.name} imageUrl={company?.logoUrl} />
              </div>
            </div>
          ) : null}
        </div>
      </header>
      <div className="flex flex-1">
        {account ? <PanelSidebar role={account.role} drawerOpen={drawerOpen} onCloseDrawer={closeDrawer} /> : null}
        <main className="min-w-zero flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
