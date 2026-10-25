import { Check } from 'lucide-react';
import mauricioChat from '../../../assets/app/mauricio.webp';
import { Container, MauricioMascot, PhoneMockup, SectionHeading } from '../../../components';
import { icon } from '../../../theme';

const HELPS = [
  'Faz perguntas com base no que você marcou, para você lembrar do que importa.',
  'Explica como ganhar mais moedas em cada avaliação.',
  'Tira dúvidas sobre fotos e sobre o que pode ser removido.',
];

export function MauricioSection() {
  return (
    <section className="py-section">
      <Container className="grid items-center gap-xxxl lg:grid-cols-2">
        <div className="flex flex-col gap-xl">
          <div className="flex">
            <MauricioMascot mood="talking" size="md" />
          </div>
          <SectionHeading
            align="left"
            eyebrow="Conheça o Maurício"
            title="Travou no comentário? O Maurício ajuda"
            description="O Maurício é o assistente da APROV. Você escreve com as suas palavras; ele só ajuda a avaliação a ficar completa."
          />
          <ul className="flex flex-col gap-md">
            {HELPS.map((help) => (
              <li key={help} className="flex items-start gap-md text-ink">
                <Check
                  size={icon.size.md}
                  strokeWidth={icon.strokeWidth}
                  className="mt-xs shrink-0 text-primary"
                  aria-hidden
                />
                {help}
              </li>
            ))}
          </ul>
        </div>
        <PhoneMockup
          src={mauricioChat}
          alt="Conversa com o Maurício no app, respondendo o que escrever e como ganhar mais moedas"
        />
      </Container>
    </section>
  );
}
