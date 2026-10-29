import { useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router';
import { Coins, Inbox, LayoutDashboard, LogOut, Package, Ticket, Search, UserRound, X, type LucideIcon } from 'lucide-react';
import { BrandMark } from '../components';
import { useQueues } from '../store/queues';
import { signOut } from '../store/session';
import { breakpoints, icon } from '../theme';
import type { Role } from '../types';
import { buildCases } from '../utils/queues';

type NavItem = { label: string; Icon: LucideIcon; to?: string; exact?: boolean; count?: number };

const ITEMS: Record<Role, NavItem[]> = {
  empresa: [
    { label: 'Visão geral', Icon: LayoutDashboard, to: '/empresa', exact: true },
    { label: 'Catálogo', Icon: Package, to: '/empresa/catalogo' },
    { label: 'Moedas', Icon: Coins, to: '/empresa/moedas' },
    { label: 'Cupons', Icon: Ticket, to: '/empresa/cupons' },
  ],
  master: [
    { label: 'Visão geral', Icon: LayoutDashboard, to: '/master', exact: true },
    { label: 'Busca avançada', Icon: Search, to: '/master/busca' },
    { label: 'Filas', Icon: Inbox, to: '/master/filas' },
  ],
};

const PROFILE: NavItem = { label: 'Perfil', Icon: UserRound };

const ITEM = 'flex shrink-0 items-center gap-md rounded-control px-md py-sm font-semibold whitespace-nowrap';

export const PANEL_DRAWER_ID = 'menu-do-painel';

function Item({ label, Icon, to, exact = false, count, onNavigate }: NavItem & { onNavigate: () => void }) {
  if (!to) {
    return (
      <span className={`${ITEM} cursor-not-allowed text-ink-faint`} aria-disabled>
        <Icon size={icon.size.md} strokeWidth={icon.strokeWidth} aria-hidden />
        {label}
      </span>
    );
  }

  return (
    <NavLink
      to={to}
      end={exact}
      onClick={onNavigate}
      className={({ isActive }) =>
        `${ITEM} ${isActive ? 'bg-primary-dim text-primary' : 'text-ink-muted hover:bg-surface-alt hover:text-ink'}`
      }
    >
      <Icon size={icon.size.md} strokeWidth={icon.strokeWidth} aria-hidden />
      {label}
      {count ? (
        <span
          className="ml-auto rounded-pill bg-primary px-sm font-semibold text-caption text-surface tabular-nums"
          aria-label={`${count} aguardando`}
        >
          {count}
        </span>
      ) : null}
    </NavLink>
  );
}

function PanelNav({ role, onNavigate }: { role: Role; onNavigate: () => void }) {
  const navigate = useNavigate();
  const { reports, resolutions, assignments, tickets } = useQueues();
  const waiting =
    role === 'master'
      ? buildCases(reports, resolutions, assignments).filter((c) => c.pending).length +
        tickets.filter((t) => t.status === 'open').length
      : 0;

  const leave = () => {
    onNavigate();
    signOut();
    navigate('/login', { replace: true });
  };

  return (
    <nav aria-label="Menu do painel" className="flex flex-1 flex-col justify-between gap-lg">
      <div className="flex flex-col gap-xs">
        {ITEMS[role].map((item) => (
          <Item key={item.label} {...item} count={item.to === '/master/filas' ? waiting : undefined} onNavigate={onNavigate} />
        ))}
      </div>
      <div className="flex flex-col gap-xs border-t border-border pt-md">
        <Item {...PROFILE} onNavigate={onNavigate} />
        <button type="button" onClick={leave} className={`${ITEM} text-ink-muted hover:bg-surface-alt hover:text-ink`}>
          <LogOut size={icon.size.md} strokeWidth={icon.strokeWidth} aria-hidden />
          Sair
        </button>
      </div>
    </nav>
  );
}

type Props = { role: Role; drawerOpen: boolean; onCloseDrawer: () => void };

export function PanelSidebar({ role, drawerOpen, onCloseDrawer }: Props) {
  useEffect(() => {
    if (!drawerOpen) return;
    const desktop = window.matchMedia(`(min-width: ${breakpoints.lg}px)`);
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCloseDrawer();
    };
    const closeOnDesktop = () => {
      if (desktop.matches) onCloseDrawer();
    };
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', closeOnEscape);
    desktop.addEventListener('change', closeOnDesktop);
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', closeOnEscape);
      desktop.removeEventListener('change', closeOnDesktop);
    };
  }, [drawerOpen, onCloseDrawer]);

  return (
    <>
      <aside className="hidden w-sidebar shrink-0 border-r border-border bg-surface lg:block">
        <div className="sticky top-header flex h-panel-body flex-col px-lg py-lg">
          <PanelNav role={role} onNavigate={() => undefined} />
        </div>
      </aside>

      <div className={`fixed inset-zero z-20 transition-all lg:hidden ${drawerOpen ? 'visible' : 'invisible'}`}>
        <div
          className={`absolute inset-zero bg-scrim transition-opacity ${drawerOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={onCloseDrawer}
          aria-hidden
        />
        <aside
          id={PANEL_DRAWER_ID}
          aria-label="Menu"
          className={`absolute inset-y-zero left-zero flex w-sidebar flex-col gap-lg bg-surface px-lg pb-lg shadow-phone transition-transform ${
            drawerOpen ? 'translate-x-zero' : '-translate-x-full'
          }`}
        >
          <div className="flex h-header shrink-0 items-center justify-between">
            <div className="flex items-center gap-sm">
              <BrandMark />
              <span className="font-display font-extrabold text-title text-primary">APROV</span>
            </div>
            <button
              type="button"
              onClick={onCloseDrawer}
              aria-label="Fechar menu"
              className="flex h-control w-control items-center justify-center rounded-pill text-ink hover:bg-surface-alt"
            >
              <X size={icon.size.lg} strokeWidth={icon.strokeWidth} aria-hidden />
            </button>
          </div>
          <PanelNav role={role} onNavigate={onCloseDrawer} />
        </aside>
      </div>
    </>
  );
}
