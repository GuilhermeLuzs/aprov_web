import { Building2, UserRound } from 'lucide-react';
import { Container, FeatureCard, SectionHeading } from '../../../components';

export function AboutSection() {
  return (
    <section id="sobre" className="scroll-mt-header py-section">
      <Container className="grid items-center gap-xxxl lg:grid-cols-2">
        <div className="flex flex-col gap-lg">
          <SectionHeading align="left" eyebrow="Sobre a APROV" title="Avaliar não precisa ser chato" />
          <p className="text-ink-muted">
            Quase ninguém avalia o que compra. Os formulários são longos, ninguém agradece pelo tempo
            gasto, e as poucas avaliações que existem dizem pouco para quem vai decidir.
          </p>
          <p className="text-ink-muted">
            A APROV muda isso: a avaliação é guiada, leva poucos toques e cada uma vale recompensa. Quem
            compra ganha voz e benefícios. Quem vende descobre o que está acertando e o que precisa
            melhorar.
          </p>
        </div>
        <div className="flex flex-col gap-xl">
          <FeatureCard
            Icon={UserRound}
            title="Para quem avalia"
            text="Uma avaliação rápida e guiada, que vira desconto nas empresas parceiras e credibilidade no seu perfil."
          />
          <FeatureCard
            Icon={Building2}
            title="Para as empresas"
            text="Avaliações frequentes e organizadas por característica, para saber o que funciona em cada produto e serviço."
          />
        </div>
      </Container>
    </section>
  );
}
