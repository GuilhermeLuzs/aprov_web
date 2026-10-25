import { Bot, Handshake, ListChecks, TrendingUp, Users, type LucideIcon } from 'lucide-react';
import { Container } from '../../../components';
import { icon } from '../../../theme';

const HIGHLIGHTS: { Icon: LucideIcon; title: string; text: string }[] = [
  {
    Icon: ListChecks,
    title: 'Avaliação passo a passo',
    text: 'Cinco etapas curtas, com uma barra mostrando o progresso e a recompensa crescendo a cada passo.',
  },
  {
    Icon: Bot,
    title: 'O Maurício te guia',
    text: 'O assistente da APROV ajuda você a contar o que importa, sem travar.',
  },
  {
    Icon: TrendingUp,
    title: 'Cada avaliação te faz evoluir',
    text: 'Ganhe XP, suba de nível e conquiste badges e cupons.',
  },
  {
    Icon: Users,
    title: 'Uma rede de avaliações',
    text: 'Siga pessoas e concorde, discorde ou comente as avaliações de quem usou de verdade.',
  },
  {
    Icon: Handshake,
    title: 'Sua voz chega à empresa',
    text: 'As empresas parceiras usam as avaliações para melhorar produtos e serviços.',
  },
];

export function HighlightsStrip() {
  return (
    <section className="border-b border-border bg-surface">
      <Container width="wide" className="grid gap-xl py-xxl md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {HIGHLIGHTS.map(({ Icon, title, text }) => (
          <div key={title} className="flex items-start gap-md">
            <Icon size={icon.size.lg} strokeWidth={icon.strokeWidth} className="shrink-0 text-primary" aria-hidden />
            <div className="flex flex-col gap-xs">
              <p className="font-semibold text-ink">{title}</p>
              <p className="text-caption text-ink-muted">{text}</p>
            </div>
          </div>
        ))}
      </Container>
    </section>
  );
}
