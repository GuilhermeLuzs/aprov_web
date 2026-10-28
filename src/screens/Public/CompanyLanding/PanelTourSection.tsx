import catalog from '../../../assets/painel/catalogo.webp';
import coinSettings from '../../../assets/painel/moedas-configuracao.webp';
import coins from '../../../assets/painel/moedas.webp';
import coupons from '../../../assets/painel/cupons.webp';
import { BrowserMockup, Container, SectionHeading } from '../../../components';

type Stop = {
  eyebrow: string;
  title: string;
  text: string;
  image: string;
  path: string;
  alt: string;
};

const STOPS: Stop[] = [
  {
    eyebrow: 'Catálogo',
    title: 'Descubra o que agrada e o que decepciona',
    text: 'Cada produto e serviço aparece com a nota média e o número de avaliações. Ordene pela nota para achar os pontos fracos, abra as notas de um item em detalhe e tire do app o que saiu de linha, sem perder o histórico.',
    image: catalog,
    path: '/empresa/catalogo',
    alt: 'Catálogo do painel, com os produtos e serviços da empresa, a nota, o número de avaliações e a situação de cada um',
  },
  {
    eyebrow: 'Sua moeda',
    title: 'Crie uma moeda com a cara da sua empresa',
    text: 'Escolha o nome, a cor e o ícone e diga quanto cada moeda vale em reais. Depois decida quanto o cliente ganha por cada parte da avaliação: palavras-chave, fotos, vídeo, comentário longo. Quem conta mais, ganha mais.',
    image: coinSettings,
    path: '/empresa/moedas',
    alt: 'Configuração da moeda no painel, com nome, valor em reais, cor, ícone e quanto cada tópico da avaliação rende',
  },
  {
    eyebrow: 'Desempenho das moedas',
    title: 'Saiba quanto a recompensa custa e quanto ela traz',
    text: 'Veja quantas moedas os clientes ganharam e quantas trocaram por cupons, quanto isso representa em reais e quais partes da avaliação mais rendem. Dá para exportar tudo em planilha.',
    image: coins,
    path: '/empresa/moedas',
    alt: 'Desempenho das moedas no painel, com as moedas com os clientes, as ganhas e os cupons resgatados, o gráfico do período e os ganhos por tópico',
  },
  {
    eyebrow: 'Cupons',
    title: 'Cupons do seu jeito, com ou sem loja virtual',
    text: 'Sem loja virtual, você cola uma lista de códigos e cada cliente que resgata recebe um diferente, para usar no balcão ou no delivery. O painel mostra quantos sobram e avisa quando a lista está acabando. Com loja virtual, o painel traz um modelo de automação para o N8N, com o passo a passo para você conectar a sua loja. Depois de configurado, cada resgate cria um cupom novo na loja, sem lista para manter.',
    image: coupons,
    path: '/empresa/cupons',
    alt: 'Tela de cupons do painel, com os cupons da empresa e os códigos disponíveis e entregues de cada um',
  },
];

export function PanelTourSection() {
  return (
    <section id="painel" className="scroll-mt-header bg-surface py-section">
      <Container width="wide" className="flex flex-col gap-section">
        <SectionHeading
          eyebrow="O painel"
          title="Tudo o que os clientes contam, num painel só"
          description="Estas são as telas do painel da APROV, com os dados de uma empresa de exemplo."
        />
        {STOPS.map((stop, index) => (
          <div key={stop.eyebrow} className="grid items-center gap-xxl lg:grid-cols-5">
            <div className={`flex flex-col gap-md lg:col-span-2 ${index % 2 === 1 ? 'lg:order-2' : ''}`}>
              <SectionHeading align="left" eyebrow={stop.eyebrow} title={stop.title} />
              <p className="max-w-text text-ink-muted">{stop.text}</p>
            </div>
            <div className="lg:col-span-3">
              <BrowserMockup src={stop.image} path={stop.path} alt={stop.alt} />
            </div>
          </div>
        ))}
      </Container>
    </section>
  );
}
