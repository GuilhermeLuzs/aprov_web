import { BadgeCheck, HandCoins, Repeat, Scale } from 'lucide-react';
import { Container, FeatureCard, SectionHeading } from '../../../components';

const RULES = [
  {
    Icon: BadgeCheck,
    title: 'Avaliações em que o cliente confia',
    text: 'Elas vão ao ar assim que o cliente envia, sem passar por você, e a empresa não pode apagá-las. Por isso quem lê acredita, e uma nota boa passa a valer de verdade.',
  },
  {
    Icon: Scale,
    title: 'Opinião sincera, não elogio comprado',
    text: 'O cliente ganha o mesmo dando nota 1 ou 5: a recompensa depende do quanto ele conta, não do que ele acha. Você recebe o retrato real do seu negócio.',
  },
  {
    Icon: Repeat,
    title: 'Cliente que volta para você',
    text: 'As moedas ganhas avaliando a sua empresa só podem ser trocadas por cupons seus. A recompensa leva o cliente de volta ao seu caixa, não ao do concorrente.',
  },
  {
    Icon: HandCoins,
    title: 'Você controla o custo',
    text: 'Você define quanto cada moeda vale, quais cupons oferecer e pode desligar as moedas quando quiser. O desconto sai da sua empresa, e a conferência do código no caixa ou no site também fica com você.',
  },
];

export function RulesSection() {
  return (
    <section id="regras" className="scroll-mt-header py-section">
      <Container className="flex flex-col gap-xxxl">
        <SectionHeading eyebrow="Regras claras" title="O combinado entre você, o cliente e a APROV" />
        <div className="grid gap-lg md:grid-cols-2">
          {RULES.map((rule) => (
            <FeatureCard key={rule.title} layout="row" Icon={rule.Icon} title={rule.title} text={rule.text} />
          ))}
        </div>
      </Container>
    </section>
  );
}
