import { Coins, PackagePlus, Smartphone } from 'lucide-react';
import { Container, FeatureCard, SectionHeading } from '../../../components';

const STEPS = [
  {
    Icon: PackagePlus,
    title: '1. Cadastre o que você vende',
    text: 'Produtos e serviços, com foto, categoria e descrição. Assim que você salva, eles aparecem no app para os clientes avaliarem.',
  },
  {
    Icon: Smartphone,
    title: '2. O cliente conta como foi',
    text: 'Ele dá nota para entrega, qualidade, conformidade e custo-benefício, marca o que foi bom e o que pode melhorar e pode mandar foto. A avaliação vai ao ar na hora.',
  },
  {
    Icon: Coins,
    title: '3. Ele ganha a sua moeda e volta',
    text: 'As moedas que ele junta viram cupons de desconto da sua empresa. Quem avaliou ganha um motivo para comprar de novo, e você, mais uma avaliação.',
  },
];

export function CompanyStepsSection() {
  return (
    <section id="como-funciona" className="scroll-mt-header py-section">
      <Container className="flex flex-col gap-xxxl">
        <SectionHeading eyebrow="Como funciona" title="Da compra à avaliação, sem você correr atrás" />
        <div className="grid gap-lg md:grid-cols-3">
          {STEPS.map((step) => (
            <FeatureCard key={step.title} Icon={step.Icon} title={step.title} text={step.text} />
          ))}
        </div>
      </Container>
    </section>
  );
}
