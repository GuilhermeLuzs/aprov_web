import { useSearchParams } from 'react-router';
import { Tabs } from '../../../components';
import { useQueues } from '../../../store/queues';
import { useCurrentAccount } from '../../../store/session';
import { buildCases } from '../../../utils/queues';
import { ReportQueue } from './ReportQueue';
import { TicketQueue } from './TicketQueue';

type Queue = 'denuncias' | 'suporte';

export default function QueuesScreen() {
  const me = useCurrentAccount()?.name ?? '';
  const { reports, resolutions, assignments, tickets } = useQueues();
  const [params, setParams] = useSearchParams();
  const queue: Queue = params.get('fila') === 'suporte' ? 'suporte' : 'denuncias';

  const pendingReports = buildCases(reports, resolutions, assignments).filter((c) => c.pending).length;
  const openTickets = tickets.filter((t) => t.status === 'open').length;

  return (
    <div className="flex flex-col gap-xl px-lg py-xl lg:px-xxl">
      <div className="flex flex-col gap-xs">
        <h1 className="font-display font-bold text-display text-ink">Filas</h1>
        <p className="text-ink-muted">
          Denúncias e pedidos de suporte esperando a administração. Os mais antigos aparecem primeiro e ficam marcados como
          atrasados depois de 48 horas.
        </p>
      </div>

      <Tabs
        label="Fila"
        value={queue}
        onChange={(next) => setParams(next === 'suporte' ? { fila: 'suporte' } : {})}
        tabs={[
          { key: 'denuncias', label: `Denúncias · ${pendingReports}` },
          { key: 'suporte', label: `Suporte · ${openTickets}` },
        ]}
      />

      {queue === 'denuncias' ? <ReportQueue me={me} /> : <TicketQueue me={me} />}
    </div>
  );
}
