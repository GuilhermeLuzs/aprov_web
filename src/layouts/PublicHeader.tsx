import { useState } from 'react';
import { Link } from 'react-router';
import { Menu, X } from 'lucide-react';
import { BrandMark, Button, Container } from '../components';
import { icon } from '../theme';

const SECTIONS = [
  { label: 'Sobre', href: '/#sobre' },
  { label: 'Como funciona', href: '/#como-funciona' },
  { label: 'Recompensas', href: '/#recompensas' },
  { label: 'Dúvidas', href: '/#duvidas' },
];

const CLIENT_CALL = { label: 'Quero avaliar', href: '/#comece' };
const COMPANY_CALL = { label: 'Sou empresa', to: '/empresas' };

export function PublicHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="sticky top-zero z-10 border-b border-border bg-surface">
      <Container className="flex h-header items-center justify-between gap-lg">
        <Link to="/" className="flex items-center gap-sm" aria-label="APROV, página inicial" onClick={closeMenu}>
          <BrandMark />
          <span className="font-display font-extrabold text-title text-primary">APROV</span>
        </Link>

        <nav className="hidden items-center gap-xl lg:flex" aria-label="Seções da página">
          {SECTIONS.map((section) => (
            <a key={section.href} href={section.href} className="whitespace-nowrap text-ink-muted hover:text-ink">
              {section.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-md">
          <div className="hidden lg:block">
            <Button label={COMPANY_CALL.label} to={COMPANY_CALL.to} variant="outline" />
          </div>
          <Button label={CLIENT_CALL.label} href={CLIENT_CALL.href} />
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="flex h-control w-control items-center justify-center rounded-pill text-ink hover:bg-surface-alt lg:hidden"
            aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={menuOpen}
            aria-controls="menu-publico"
          >
            {menuOpen ? (
              <X size={icon.size.lg} strokeWidth={icon.strokeWidth} aria-hidden />
            ) : (
              <Menu size={icon.size.lg} strokeWidth={icon.strokeWidth} aria-hidden />
            )}
          </button>
        </div>
      </Container>

      {menuOpen ? (
        <nav id="menu-publico" className="border-t border-border bg-surface lg:hidden" aria-label="Menu">
          <Container className="flex flex-col gap-xs py-lg">
            {SECTIONS.map((section) => (
              <a
                key={section.href}
                href={section.href}
                onClick={closeMenu}
                className="rounded-control p-md text-ink hover:bg-surface-alt"
              >
                {section.label}
              </a>
            ))}
            <Link
              to={COMPANY_CALL.to}
              onClick={closeMenu}
              className="rounded-control p-md font-semibold text-primary hover:bg-primary-dim"
            >
              {COMPANY_CALL.label}
            </Link>
          </Container>
        </nav>
      ) : null}
    </header>
  );
}
