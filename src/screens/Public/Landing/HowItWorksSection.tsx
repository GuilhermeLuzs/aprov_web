import { useEffect, useState } from 'react';
import inicio from '../../../assets/app/inicio.webp';
import avaliacao from '../../../assets/app/avaliacao.webp';
import publicada from '../../../assets/app/publicada.webp';
import { Container, PhoneMockup, SectionHeading } from '../../../components';

const AUTO_ADVANCE_MS = 5000;

const STEPS = [
  {
    screen: inicio,
    screenAlt: 'Tela inicial do app da APROV, com produtos das empresas parceiras',
    title: 'Encontre o que você usou',
    text: 'Procure por empresa, produto ou serviço. Tudo o que as empresas parceiras oferecem aparece no Início.',
  },
  {
    screen: avaliacao,
    screenAlt: 'Primeira das cinco etapas da avaliação no app, com estrelas para cada característica',
    title: 'Avalie em cinco etapas',
    text: 'Dê estrelas para cada característica e marque palavras-chave do que foi bom e do que pode melhorar. Depois envie foto ou vídeo, obrigatório para produto e opcional para serviço, e escreva o comentário, com o Maurício no chat se você travar.',
  },
  {
    screen: publicada,
    screenAlt: 'Tela de avaliação publicada no app, com as moedas, os pontos APROV e o XP ganhos',
    title: 'Publique e ganhe na hora',
    text: 'A avaliação entra no ar assim que você publica, e as recompensas caem na mesma hora.',
  },
];

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function StepNumber({ value, active }: { value: number; active: boolean }) {
  return (
    <span
      className={`flex h-control w-control shrink-0 items-center justify-center rounded-pill font-display font-bold text-subtitle ${
        active ? 'bg-primary text-surface' : 'bg-primary-dim text-primary'
      }`}
    >
      {value}
    </span>
  );
}

export function HowItWorksSection() {
  const [active, setActive] = useState(0);
  const [pickedByUser, setPickedByUser] = useState(false);

  useEffect(() => {
    if (pickedByUser || prefersReducedMotion()) return;
    const timer = window.setInterval(() => setActive((step) => (step + 1) % STEPS.length), AUTO_ADVANCE_MS);
    return () => window.clearInterval(timer);
  }, [pickedByUser]);

  useEffect(() => {
    STEPS.forEach((step) => {
      const preload = new Image();
      preload.src = step.screen;
    });
  }, []);

  const pick = (index: number) => {
    setActive(index);
    setPickedByUser(true);
  };

  const heading = (
    <SectionHeading
      align="left"
      eyebrow="Como funciona"
      title="Da compra à recompensa em etapas objetivas"
    />
  );

  return (
    <section id="como-funciona" className="scroll-mt-header py-section">
      <Container className="hidden items-center gap-xxxl lg:grid lg:grid-cols-2">
        <div className="flex flex-col gap-xl">
          {heading}
          <ol className="flex flex-col gap-sm">
            {STEPS.map((step, index) => (
              <li key={step.title}>
                <button
                  type="button"
                  onClick={() => pick(index)}
                  aria-pressed={active === index}
                  className={`flex w-full items-start gap-lg rounded-card border p-md text-left transition-colors ${
                    active === index
                      ? 'border-primary bg-surface shadow-card'
                      : 'border-transparent hover:bg-surface'
                  }`}
                >
                  <StepNumber value={index + 1} active={active === index} />
                  <span className="flex flex-col gap-xs">
                    <span className="font-display font-semibold text-subtitle text-ink">{step.title}</span>
                    <span className="text-ink-muted">{step.text}</span>
                  </span>
                </button>
              </li>
            ))}
          </ol>
        </div>
        <PhoneMockup src={STEPS[active].screen} alt={STEPS[active].screenAlt} />
      </Container>

      <Container className="flex flex-col gap-xxxl lg:hidden">
        {heading}
        <ol className="flex flex-col gap-xxxl">
          {STEPS.map((step, index) => (
            <li key={step.title} className="flex flex-col items-center gap-xl text-center">
              <PhoneMockup src={step.screen} alt={step.screenAlt} />
              <div className="flex flex-col items-center gap-sm">
                <StepNumber value={index + 1} active />
                <h3 className="font-display font-semibold text-title text-ink">{step.title}</h3>
                <p className="text-ink-muted">{step.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
