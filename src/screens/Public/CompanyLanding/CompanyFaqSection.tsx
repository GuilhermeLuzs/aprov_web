import { Container, FaqItem, SectionHeading } from '../../../components';

const QUESTIONS = [
  {
    question: 'O que preciso para cadastrar a minha empresa?',
    answer:
      'Os dados da empresa (CNPJ, endereço, e-mail, telefone, nicho, modalidade e porte) e os do responsável (nome, CPF, e-mail e telefone). O cadastro é feito aqui no site, em três etapas.',
  },
  {
    question: 'Posso tirar uma avaliação do ar?',
    answer:
      'Não. A avaliação é publicada na hora e só sai do ar se desrespeitar as regras, depois de uma denúncia analisada pela APROV.',
  },
  {
    question: 'Preciso de uma loja virtual para oferecer cupons?',
    answer:
      'Não. Sem loja virtual, você cria os códigos onde preferir (no sistema do caixa ou numa planilha, por exemplo) e cola a lista no painel. Cada cliente que resgata recebe um código diferente para usar no balcão ou no delivery. Com loja virtual, você conecta a loja à APROV pelo N8N, com o modelo de automação que o painel oferece, e ela cria um cupom novo a cada resgate, sem você cadastrar códigos.',
  },
  {
    question: 'Posso desligar as moedas?',
    answer:
      'Pode. Os clientes continuam com o saldo que já juntaram, mas não ganham moedas novas nem resgatam cupons até você ligar de novo.',
  },
  {
    question: 'Quem vê as avaliações da minha empresa?',
    answer: 'Todo mundo que usa o app. As avaliações são públicas, para ajudar quem vai comprar.',
  },
  {
    question: 'Posso tirar um produto ou serviço do app?',
    answer: 'Pode. Um item desativado sai das buscas e do catálogo no app, e as avaliações que ele já recebeu continuam no seu painel.',
  },
];

export function CompanyFaqSection() {
  return (
    <section id="duvidas" className="scroll-mt-header bg-surface py-section">
      <Container className="flex flex-col gap-xxxl">
        <SectionHeading eyebrow="Dúvidas" title="Perguntas das empresas" />
        <div className="grid w-full gap-md lg:grid-cols-2 lg:items-start">
          {QUESTIONS.map((item) => (
            <FaqItem key={item.question} question={item.question} answer={item.answer} />
          ))}
        </div>
      </Container>
    </section>
  );
}
