import { useState } from 'react';
import { Link } from 'react-router';
import { Button, Modal, TextAreaField } from '../../../components';
import { customers } from '../../../mocks';
import { assign, replyToTicket, setTicketStatus } from '../../../store/queues';
import { useCompanies } from '../../../store/session';
import { showToast } from '../../../store/toasts';
import { TICKET_TOPIC_LABEL, type Ticket } from '../../../types';
import { ACCOUNT_PATH } from '../../../utils/accountSearch';
import { formatDateTime } from '../../../utils/format';
import { TicketStatusBadge } from './QueueParts';

const REPLY_MAX = 1000;

const REQUESTER_KIND = { customer: 'Cliente', company: 'Empresa parceira' };

type Props = { ticket: Ticket; assignee?: string; me: string; onClose: () => void };

export function TicketModal({ ticket, assignee, me, onClose }: Props) {
  const companies = useCompanies();
  const [reply, setReply] = useState('');
  const [error, setError] = useState<string | null>(null);
  const requester =
    ticket.requester.kind === 'customer'
      ? customers.find((c) => c.id === ticket.requester.id)
      : companies.find((c) => c.id === ticket.requester.id);

  const resolved = ticket.status === 'resolved';

  const send = () => {
    if (reply.trim() === '') {
      setError('Escreva a resposta antes de enviar.');
      return;
    }
    if (reply.length > REPLY_MAX) {
      setError(`Use no máximo ${REPLY_MAX} caracteres.`);
      return;
    }
    replyToTicket(ticket.id, me, reply.trim(), 'waiting');
    if (!assignee) assign('ticket', ticket.id, me);
    setReply('');
    showToast('success', 'Resposta enviada. O ticket aguarda o solicitante.');
  };

  const closeCase = () => {
    setTicketStatus(ticket.id, 'resolved');
    showToast('success', 'Caso encerrado.');
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={ticket.subject}
      subtitle={
        <div className="flex flex-wrap items-center gap-sm text-caption text-ink-muted">
          <TicketStatusBadge status={ticket.status} />
          <span>{TICKET_TOPIC_LABEL[ticket.topic]}</span>
          <span aria-hidden>·</span>
          <span>
            {REQUESTER_KIND[ticket.requester.kind]}{' '}
            {requester ? (
              <Link
                to={`${ACCOUNT_PATH[ticket.requester.kind]}/${ticket.requester.id}`}
                className="sensitive font-semibold text-primary hover:text-primary-press"
              >
                {requester.name}
              </Link>
            ) : (
              'removido'
            )}
          </span>
        </div>
      }
      footer={
        <>
          {resolved ? null : <Button label="Encerrar caso" variant="text" onClick={closeCase} />}
          <Button label="Responder" onClick={send} />
        </>
      }
    >
      <div className="flex flex-wrap items-center gap-sm text-caption text-ink-muted">
        {assignee ? (
          <span>
            Responsável: <span className="font-semibold text-ink">{assignee === me ? 'você' : assignee}</span>
          </span>
        ) : (
          <>
            <span>Sem responsável.</span>
            <button
              type="button"
              onClick={() => assign('ticket', ticket.id, me)}
              className="font-semibold text-primary hover:text-primary-press"
            >
              Assumir
            </button>
          </>
        )}
      </div>

      <ol className="flex flex-col gap-md" aria-label="Conversa">
        {ticket.messages.map((message) => {
          const mine = message.from === 'admin';
          return (
            <li key={message.id} className={`flex flex-col gap-xs ${mine ? 'items-end' : 'items-start'}`}>
              <div className={`max-w-text rounded-card p-md text-ink ${mine ? 'bg-primary-dim' : 'bg-surface-alt'}`}>
                <p className={mine ? '' : 'sensitive'}>{message.text}</p>
              </div>
              <span className="text-caption text-ink-muted">
                <span className={mine ? '' : 'sensitive'}>{message.author}</span> · {formatDateTime(message.createdAt)}
              </span>
            </li>
          );
        })}
      </ol>

      <TextAreaField
        label="Sua resposta"
        value={reply}
        onChange={(value) => {
          setReply(value);
          setError(null);
        }}
        maxLength={REPLY_MAX}
        rows={4}
        placeholder={`Escreva para ${requester?.name ?? 'o solicitante'}.`}
        error={error ?? undefined}
      />
      {resolved ? (
        <p className="text-caption text-ink-muted">Este caso está encerrado. Se você responder, ele volta para "Aguardando resposta".</p>
      ) : null}
    </Modal>
  );
}
