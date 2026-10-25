import { MessageSquareText, ThumbsUp, UserPlus } from 'lucide-react';
import feed from '../../../assets/app/feed.webp';
import { Container, FeatureCard, PhoneMockup, SectionHeading } from '../../../components';

export function CommunitySection() {
  return (
    <section className="bg-surface py-section">
      <Container className="grid items-center gap-xxxl lg:grid-cols-2">
        <PhoneMockup src={feed} alt="Feed do app da APROV, com avaliações de outros clientes" />
        <div className="flex flex-col gap-lg">
          <SectionHeading
            align="left"
            eyebrow="Comunidade"
            title="Opinião que ajuda quem vai comprar"
            description="Toda avaliação publicada aparece no Feed, para quem está decidindo o que comprar ou contratar."
          />
          <FeatureCard
            layout="row"
            Icon={MessageSquareText}
            title="Leia quem usou de verdade"
            text="Notas por característica, palavras-chave, fotos e comentários de quem já comprou ou contratou."
          />
          <FeatureCard
            layout="row"
            Icon={ThumbsUp}
            title="Concorde ou discorde"
            text="Mostre se uma avaliação bate com a sua experiência e comente para continuar a conversa."
          />
          <FeatureCard
            layout="row"
            Icon={UserPlus}
            title="Siga quem entende"
            text="Acompanhe as avaliações de quem tem o mesmo gosto que você na aba Seguindo."
          />
        </div>
      </Container>
    </section>
  );
}
