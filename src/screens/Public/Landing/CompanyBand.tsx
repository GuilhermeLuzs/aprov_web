import { Button, Container } from '../../../components';

export function CompanyBand() {
  return (
    <section className="bg-ink text-surface">
      <Container className="flex flex-col gap-xl py-xxxl md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-sm">
          <h2 className="font-display font-bold text-display">Tem uma empresa?</h2>
          <p className="max-w-text text-ink-faint">
            Receba avaliações frequentes e organizadas dos seus clientes, crie a sua moeda e acompanhe
            tudo em um painel.
          </p>
        </div>
        <Button label="Conheça a APROV para empresas" to="/empresas" />
      </Container>
    </section>
  );
}
