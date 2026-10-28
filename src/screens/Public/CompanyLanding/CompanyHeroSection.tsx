import overview from '../../../assets/painel/visao-geral.webp';
import { BrowserMockup, Container } from '../../../components';

export function CompanyHeroSection() {
  return (
    <section className="relative overflow-hidden bg-linear-to-r from-primary to-primary-bright text-surface">
      <div className="star-pattern star-fade-left absolute inset-zero" aria-hidden />
      <Container width="wide" className="relative grid items-center gap-xxxl py-section lg:grid-cols-2">
        <div className="flex flex-col gap-lg">
          <span className="font-semibold text-caption uppercase">APROV para empresas</span>
          <h1 className="font-display font-extrabold text-banner-sm italic md:text-banner-md">
            Saiba o que os seus clientes acham, com nota e motivo
          </h1>
          <p className="max-w-text font-display font-semibold text-subtitle">
            O cliente avalia pelo app o que comprou de você e ganha a sua moeda para trocar por cupons. Você acompanha tudo em
            um painel: as notas, as palavras-chave e os itens que mais agradam ou decepcionam.
          </p>
        </div>
        <BrowserMockup
          src={overview}
          path="/empresa"
          alt="Visão geral do painel da empresa, com a nota média geral, as avaliações no período, as notas de cada característica e o gráfico das notas ao longo do período"
        />
      </Container>
    </section>
  );
}
