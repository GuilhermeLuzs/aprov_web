import { BrandMark, MauricioMascot } from '../../components';

export default function LandingScreen() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-lg p-lg">
      <MauricioMascot mood="talking" size="lg" />
      <div className="flex items-center gap-sm">
        <BrandMark />
        <h1 className="font-display font-extrabold text-display text-primary">APROV</h1>
      </div>
      <p className="text-ink-muted">Avalie o que você usa e ganhe recompensas.</p>
    </main>
  );
}
