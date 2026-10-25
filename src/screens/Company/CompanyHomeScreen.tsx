import { UnderConstruction } from '../../components';
import { useCurrentAccount } from '../../store/session';

export default function CompanyHomeScreen() {
  const account = useCurrentAccount();

  return (
    <UnderConstruction
      title={`Olá, ${account?.name ?? 'empresa'}`}
      text="O painel da empresa está em construção. Em breve, é aqui que você vai cadastrar seus produtos e serviços, configurar a sua moeda e acompanhar as avaliações dos clientes."
    />
  );
}
