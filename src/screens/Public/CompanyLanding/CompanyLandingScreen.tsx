import { Container, MauricioMascot } from '../../../components';

export default function CompanyLandingScreen() {
  return (
    <section className="py-section">
      <Container className="flex flex-col items-center gap-xl text-center">
        <MauricioMascot mood="talking" size="lg" />
        <div className="flex max-w-text flex-col gap-md">
          <span className="font-semibold text-caption text-primary uppercase">APROV para empresas</span>
          <h1 className="font-display font-extrabold text-display text-ink md:text-banner-sm">
            Receba avaliações reais dos seus clientes
          </h1>
          <p className="text-ink-muted">
            Em breve, esta página vai mostrar tudo o que a APROV oferece para a sua empresa. Enquanto
            isso, cadastre a sua empresa ou entre na sua conta.
          </p>
        </div>
      </Container>
    </section>
  );
}
