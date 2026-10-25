import { Container, MauricioMascot } from '../../../components';

export function FinalCallSection() {
  return (
    <section id="comece" className="scroll-mt-header bg-primary-dim py-section">
      <Container className="flex flex-col items-center gap-lg text-center">
        <MauricioMascot mood="starry" size="md" />
        <h2 className="font-display font-bold text-display text-ink">
          Sua próxima avaliação já vale mais
        </h2>
        <p className="max-w-text text-ink-muted">
          O cadastro é feito pelo aplicativo da APROV, em poucos passos. Depois é só escolher o primeiro
          item, avaliar e ver as recompensas chegarem.
        </p>
      </Container>
    </section>
  );
}
