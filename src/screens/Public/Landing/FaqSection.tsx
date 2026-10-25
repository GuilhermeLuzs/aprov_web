import { Container, FaqItem, SectionHeading } from '../../../components';

const QUESTIONS = [
  {
    question: 'A APROV é grátis?',
    answer: 'Sim. Usar o aplicativo, avaliar e ganhar recompensas não custa nada.',
  },
  {
    question: 'Como funcionam os descontos?',
    answer:
      'Cada empresa parceira tem a sua moeda. Você junta moedas avaliando os produtos e serviços dela e troca por cupons de desconto na própria empresa.',
  },
  {
    question: 'O que é credibilidade no perfil?',
    answer:
      'Seu perfil mostra o seu nível e as suas badges. Quanto mais você avalia, mais alto fica o nível, e quem lê suas avaliações sabe que você tem experiência.',
  },
  {
    question: 'Posso dar nota baixa?',
    answer:
      'Pode, e ganha igual. A recompensa depende do que você conta (estrelas, palavras-chave, foto e comentário), não da nota que você dá.',
  },
  {
    question: 'A empresa pode apagar a minha avaliação?',
    answer:
      'Não. A avaliação é publicada na hora e só sai do ar se desrespeitar as regras, depois de uma denúncia analisada pela APROV.',
  },
  {
    question: 'Quem é o Maurício?',
    answer:
      'É o assistente da APROV. Ele acompanha você pelo app e, na hora de escrever, faz perguntas para a sua avaliação ficar completa.',
  },
  {
    question: 'Meus dados estão seguros?',
    answer:
      'Suas avaliações são públicas, mas seus dados pessoais ficam só com a APROV e não aparecem para as empresas. Tudo segue a LGPD, e você pode pedir a exclusão dos seus dados quando quiser.',
  },
];

export function FaqSection() {
  return (
    <section id="duvidas" className="scroll-mt-header py-section">
      <Container className="flex flex-col gap-xxxl">
        <SectionHeading eyebrow="Dúvidas" title="Perguntas frequentes" />
        <div className="grid w-full gap-md lg:grid-cols-2 lg:items-start">
          {QUESTIONS.map((item) => (
            <FaqItem key={item.question} question={item.question} answer={item.answer} />
          ))}
        </div>
      </Container>
    </section>
  );
}
