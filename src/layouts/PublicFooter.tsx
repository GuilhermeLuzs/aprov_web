import { Link } from 'react-router';
import { BrandMark, Container } from '../components';

const SECTIONS = [
  { label: 'Sobre a APROV', href: '/#sobre' },
  { label: 'Como funciona', href: '/#como-funciona' },
  { label: 'Recompensas', href: '/#recompensas' },
  { label: 'Dúvidas', href: '/#duvidas' },
];

const PAGES = [{ label: 'Para empresas', to: '/empresas' }];

const LINK_CLASS = 'text-caption text-ink-muted hover:text-ink';

export function PublicFooter() {
  return (
    <footer className="border-t border-border bg-surface">
      <Container className="flex flex-col gap-xl py-xxl md:flex-row md:items-start md:justify-between">
        <div className="flex flex-col gap-sm">
          <div className="flex items-center gap-sm">
            <BrandMark />
            <span className="font-display font-extrabold text-title text-primary">APROV</span>
          </div>
          <p className="text-caption text-ink-muted">Avalie o que você usa e ganhe recompensas.</p>
        </div>

        <nav className="flex flex-col gap-sm md:flex-row md:gap-xl" aria-label="Rodapé">
          {SECTIONS.map((section) => (
            <a key={section.href} href={section.href} className={LINK_CLASS}>
              {section.label}
            </a>
          ))}
          {PAGES.map((page) => (
            <Link key={page.to} to={page.to} className={LINK_CLASS}>
              {page.label}
            </Link>
          ))}
        </nav>
      </Container>

      <Container className="border-t border-border py-lg">
        <p className="text-caption text-ink-faint">© 2026 APROV</p>
      </Container>
    </footer>
  );
}
