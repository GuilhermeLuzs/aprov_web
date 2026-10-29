import { useCallback, useState } from 'react';
import { EmptyNotice, FilterSelect, Tabs } from '../../../components';
import { customers } from '../../../mocks';
import { useQueues } from '../../../store/queues';
import { useCompanies } from '../../../store/session';
import { TICKET_STATUS_LABEL, TICKET_TOPIC_LABEL, type AccountKind, type TicketStatus, type TicketTopic } from '../../../types';
import {
  DEFAULT_TICKET_FILTERS,
  OWNER_OPTIONS,
  filterTickets,
  lastActivity,
  ticketAssignee,
  waitingSince,
  type OwnerFilter,
  type TicketFilters,
} from '../../../utils/queues';
import { AgeLabel } from './QueueParts';
import { TicketModal } from './TicketModal';

const TOPIC_OPTIONS = (Object.keys(TICKET_TOPIC_LABEL) as TicketTopic[]).map((value) => ({
  value,
  label: TICKET_TOPIC_LABEL[value],
}));

const REQUESTER_OPTIONS = [
  { value: 'customer', label: 'Clientes' },
  { value: 'company', label: 'Empresas parceiras' },
];

const STATUSES = Object.keys(TICKET_STATUS_LABEL) as TicketStatus[];

const STATUS_TAB: Record<TicketStatus, string> = { open: 'Abertos', waiting: 'Aguardando resposta', resolved: 'Resolvidos' };

export function TicketQueue({ me }: { me: string }) {
  const { tickets, assignments } = useQueues();
  const companies = useCompanies();
  const [filters, setFilters] = useState<TicketFilters>(DEFAULT_TICKET_FILTERS);
  const [openId, setOpenId] = useState<string | null>(null);
  const close = useCallback(() => setOpenId(null), []);

  const visible = filterTickets(tickets, filters, assignments, me);
  const openTicket = tickets.find((t) => t.id === openId);
  const countOf = (status: TicketStatus) => tickets.filter((t) => t.status === status).length;
  const update = (change: Partial<TicketFilters>) => setFilters((current) => ({ ...current, ...change }));

  const nameOf = (kind: AccountKind, id: string) =>
    (kind === 'customer' ? customers.find((c) => c.id === id) : companies.find((c) => c.id === id))?.name ?? 'Conta removida';

  return (
    <div className="flex flex-col gap-lg">
      <div className="flex flex-col gap-md xl:flex-row xl:items-center xl:justify-between">
        <Tabs
          label="Situação"
          size="sm"
          value={filters.status}
          onChange={(status) => update({ status })}
          tabs={STATUSES.map((status) => ({
            key: status,
            label: status === 'resolved' ? STATUS_TAB[status] : `${STATUS_TAB[status]} · ${countOf(status)}`,
          }))}
        />
        <div className="grid gap-md sm:grid-cols-3 xl:flex xl:flex-wrap">
          <FilterSelect
            label="Assunto"
            value={filters.topic}
            onChange={(topic) => update({ topic: topic as TicketTopic | '' })}
            allLabel="Todos os assuntos"
            options={TOPIC_OPTIONS}
          />
          <FilterSelect
            label="Solicitante"
            value={filters.requester}
            onChange={(requester) => update({ requester: requester as AccountKind | '' })}
            allLabel="Clientes e empresas"
            options={REQUESTER_OPTIONS}
          />
          <FilterSelect
            label="Responsável"
            value={filters.owner}
            onChange={(owner) => update({ owner: owner as OwnerFilter })}
            allLabel="Qualquer responsável"
            options={OWNER_OPTIONS}
          />
        </div>
      </div>

      {visible.length === 0 ? (
        <EmptyNotice
          mood={filters.status === 'open' && countOf('open') === 0 ? 'starry' : 'confused'}
          title={filters.status === 'open' && countOf('open') === 0 ? 'Nenhum ticket aberto' : 'Nada com esses filtros'}
          text={
            filters.status === 'open' && countOf('open') === 0
              ? 'Todo mundo já foi respondido. Novos pedidos de suporte aparecem aqui.'
              : 'Tire algum filtro para ver mais tickets.'
          }
        />
      ) : (
        <ul className="flex flex-col gap-md">
          {visible.map((ticket) => {
            const assignee = ticketAssignee(assignments, ticket);
            const last = ticket.messages[ticket.messages.length - 1];
            return (
              <li key={ticket.id}>
                <button
                  type="button"
                  onClick={() => setOpenId(ticket.id)}
                  className="flex w-full flex-col gap-sm rounded-card border border-border bg-surface p-lg text-left transition-colors hover:border-primary"
                >
                  <div className="flex flex-wrap items-center gap-sm">
                    <span className="rounded-pill bg-surface-alt px-sm py-xs font-semibold text-caption text-ink">
                      {TICKET_TOPIC_LABEL[ticket.topic]}
                    </span>
                    <span className="text-caption text-ink-muted">
                      {ticket.requester.kind === 'customer' ? 'Cliente' : 'Empresa'} ·{' '}
                      <span className="sensitive">{nameOf(ticket.requester.kind, ticket.requester.id)}</span>
                    </span>
                  </div>
                  <span className="font-semibold text-ink">{ticket.subject}</span>
                  {last ? (
                    <span className="sensitive line-clamp-2 text-ink-muted">
                      {last.from === 'admin' ? 'Você: ' : ''}
                      {last.text}
                    </span>
                  ) : null}
                  <div className="flex flex-wrap items-center justify-end gap-md">
                    <span className="text-caption text-ink-muted">
                      {assignee ? `Com ${assignee === me ? 'você' : assignee}` : 'Sem responsável'}
                    </span>
                    {ticket.status === 'open' ? (
                      <AgeLabel since={waitingSince(ticket)} />
                    ) : (
                      <AgeLabel since={lastActivity(ticket)} overdueCheck={false} />
                    )}
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {openTicket ? (
        <TicketModal key={openTicket.id} ticket={openTicket} assignee={ticketAssignee(assignments, openTicket)} me={me} onClose={close} />
      ) : null}
    </div>
  );
}
