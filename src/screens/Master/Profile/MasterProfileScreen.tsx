import { Link } from 'react-router';
import { CompanyAvatar, StatTile } from '../../../components';
import { customers } from '../../../mocks';
import { useAccessEvents } from '../../../store/moderation';
import { useQueues } from '../../../store/queues';
import { useCompanies, useCurrentAccount } from '../../../store/session';
import { ACCESS_ACTION_LABEL, PANEL_LABEL } from '../../../types';
import { ACCOUNT_PATH } from '../../../utils/accountSearch';
import { formatDateTime, formatInt } from '../../../utils/format';
import { useTargetInfo } from '../Queues/useTargetInfo';
import { PasswordForm, ProfileDataForm } from './ProfileForms';

const RECENT_ACTIONS = 8;

type Action = { id: string; at: string; title: string; detail: string; to: string };

const DECISION_TITLE = {
  review: { removed: 'Removeu uma avaliação', kept: 'Manteve uma avaliação' },
  item: { removed: 'Inativou um item', kept: 'Manteve um item' },
};

export default function MasterProfileScreen() {
  const account = useCurrentAccount();
  const companies = useCompanies();
  const targetInfo = useTargetInfo();
  const accessEvents = useAccessEvents();
  const { resolutions, tickets } = useQueues();

  if (!account) return null;

  const accountName = (kind: 'customer' | 'company', id: string) =>
    (kind === 'customer' ? customers.find((c) => c.id === id) : companies.find((c) => c.id === id))?.name ?? 'Conta removida';

  const mine = accessEvents.filter((e) => e.byId === account.id);
  const decisions = resolutions.filter((r) => r.byId === account.id);
  const replies = tickets.flatMap((ticket) =>
    ticket.messages.filter((m) => m.from === 'admin' && m.adminId === account.id).map((message) => ({ ticket, message })),
  );

  const actions: Action[] = [
    ...mine.map((e) => ({
      id: e.id,
      at: e.createdAt,
      title: ACCESS_ACTION_LABEL[e.action],
      detail: accountName(e.account.kind, e.account.id),
      to: `${ACCOUNT_PATH[e.account.kind]}/${e.account.id}`,
    })),
    ...decisions.map((r) => ({
      id: `${r.target.kind}:${r.target.id}:${r.at}`,
      at: r.at,
      title: DECISION_TITLE[r.target.kind][r.decision],
      detail: targetInfo(r.target).title,
      to: '/master/filas',
    })),
    ...replies.map(({ ticket, message }) => ({
      id: message.id,
      at: message.createdAt,
      title: 'Respondeu um ticket',
      detail: ticket.subject,
      to: '/master/filas?fila=suporte',
    })),
  ]
    .sort((a, b) => b.at.localeCompare(a.at))
    .slice(0, RECENT_ACTIONS);

  return (
    <div className="flex flex-col gap-xl px-lg py-xl lg:px-xxl">
      <div className="flex flex-wrap items-center gap-lg">
        <CompanyAvatar name={account.name} />
        <div className="flex min-w-zero flex-col gap-xs">
          <h1 className="sensitive font-display font-bold text-display text-ink">{account.name}</h1>
          <p className="text-ink-muted">
            <span className="capitalize">{PANEL_LABEL[account.role]}</span> · <span className="sensitive">{account.email}</span>
          </p>
        </div>
      </div>

      <div className="grid items-start gap-lg lg:grid-cols-2">
        <ProfileDataForm key={`${account.name}-${account.email}`} account={account} />
        <PasswordForm account={account} />
      </div>

      <section className="flex flex-col gap-lg">
        <div className="flex flex-col gap-xs">
          <h2 className="font-display font-semibold text-title text-ink">Sua atividade</h2>
          <p className="text-caption text-ink-muted">O que você fez na moderação e no suporte, desde o início.</p>
        </div>
        <div className="grid gap-lg sm:grid-cols-2 xl:grid-cols-4">
          <StatTile label="Acessos suspensos" value={formatInt(mine.filter((e) => e.action === 'suspend').length)} detail="de clientes e empresas" />
          <StatTile label="Acessos reativados" value={formatInt(mine.filter((e) => e.action === 'reactivate').length)} detail="depois de revisar" />
          <StatTile label="Denúncias decididas" value={formatInt(decisions.length)} detail="removidas ou mantidas" />
          <StatTile label="Respostas a tickets" value={formatInt(replies.length)} detail="mensagens enviadas" />
        </div>
        <div className="flex flex-col gap-md rounded-card border border-border bg-surface p-lg">
          <h3 className="font-semibold text-ink">Ações recentes</h3>
          {actions.length === 0 ? (
            <p className="text-caption text-ink-muted">Você ainda não fez nenhuma ação na moderação ou no suporte.</p>
          ) : (
            <ol className="flex flex-col">
              {actions.map((action) => (
                <li key={action.id} className="flex flex-wrap items-baseline justify-between gap-sm border-b border-border py-sm last:border-b-0">
                  <div className="flex min-w-zero flex-col gap-xs">
                    <span className="font-semibold text-ink">{action.title}</span>
                    <Link to={action.to} className="sensitive truncate text-caption text-primary hover:text-primary-press">
                      {action.detail}
                    </Link>
                  </div>
                  <span className="text-caption text-ink-muted">{formatDateTime(action.at)}</span>
                </li>
              ))}
            </ol>
          )}
        </div>
      </section>
    </div>
  );
}
