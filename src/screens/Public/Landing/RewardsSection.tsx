import { BadgeCheck, Sparkles, Ticket } from 'lucide-react';
import carteira from '../../../assets/app/carteira.webp';
import { Container, FeatureCard, PhoneMockup, SectionHeading } from '../../../components';

export function RewardsSection() {
  return (
    <section id="recompensas" className="scroll-mt-header bg-surface py-section">
      <Container className="grid items-center gap-xxxl lg:grid-cols-2">
        <PhoneMockup
          src={carteira}
          alt="Carteira do app da APROV, com os pontos APROV e as moedas de cada empresa parceira"
        />
        <div className="flex flex-col gap-lg">
          <SectionHeading
            align="left"
            eyebrow="Recompensas"
            title="O que você ganha avaliando"
            description="Cada avaliação publicada rende três recompensas, e cada uma serve para uma coisa."
          />
          <FeatureCard
            layout="row"
            Icon={Ticket}
            title="Descontos"
            text="Cada empresa parceira tem a sua moeda. Junte avaliando os produtos e serviços dela e troque por cupons de desconto na própria empresa."
          />
          <FeatureCard
            layout="row"
            Icon={BadgeCheck}
            title="Credibilidade"
            text="O XP, seus pontos de experiência, sobe o seu nível e libera badges. Quem lê suas avaliações vê que você avalia sério."
          />
          <FeatureCard
            layout="row"
            Icon={Sparkles}
            title="Estilo"
            text="Os pontos APROV valem em toda a plataforma e compram molduras de perfil e skins do Maurício na Loja."
          />
        </div>
      </Container>
    </section>
  );
}
