import { Link } from 'react-router';
import { BrandMark, Button, Container } from '../components';

export function CompanyHeader() {
  return (
    <header className="sticky top-zero z-10 border-b border-border bg-surface">
      <Container className="flex h-header items-center justify-between gap-lg">
        <Link to="/empresas" className="flex items-center gap-sm" aria-label="APROV para empresas">
          <BrandMark />
          <span className="hidden font-display font-extrabold text-title text-primary sm:inline">APROV</span>
          <span className="hidden font-semibold text-caption text-ink-muted md:inline">para empresas</span>
        </Link>

        <div className="flex items-center gap-lg">
          <Link to="/login" className="whitespace-nowrap font-semibold text-primary hover:text-primary-press">
            Entrar
          </Link>
          <Button label="Cadastrar empresa" to="/cadastro" />
        </div>
      </Container>
    </header>
  );
}
