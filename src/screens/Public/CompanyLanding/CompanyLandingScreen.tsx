import { Container, MauricioMascot } from '../../../components';
import { CompanyFaqSection } from './CompanyFaqSection';
import { CompanyHeroSection } from './CompanyHeroSection';
import { CompanyStepsSection } from './CompanyStepsSection';
import { PanelTourSection } from './PanelTourSection';
import { RulesSection } from './RulesSection';

function FinalCall() {
  return (
    <section className="bg-primary-dim py-section">
      <Container className="flex flex-col items-center gap-lg text-center">
        <MauricioMascot mood="starry" size="md" />
        <h2 className="font-display font-bold text-display text-ink">Comece a ouvir os seus clientes</h2>
        <p className="max-w-text text-ink-muted">
          Cadastre a empresa, coloque os seus itens no catálogo e crie a sua moeda. As avaliações chegam pelo app.
        </p>
      </Container>
    </section>
  );
}

export default function CompanyLandingScreen() {
  return (
    <>
      <CompanyHeroSection />
      <CompanyStepsSection />
      <PanelTourSection />
      <RulesSection />
      <CompanyFaqSection />
      <FinalCall />
    </>
  );
}
