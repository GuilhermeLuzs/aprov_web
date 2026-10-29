import type { ReactNode } from 'react';
import { Link, useLocation } from 'react-router';
import { ArrowLeft, Ban, RotateCcw } from 'lucide-react';
import { Button, EmptyNotice } from '../../../components';
import { icon } from '../../../theme';
import { ACCESS_ACTION_LABEL, ACCESS_REASON_LABEL, type AccessEvent } from '../../../types';
import { SEARCH_PATH } from '../../../utils/accountSearch';
import { formatDateTime } from '../../../utils/format';

type BackState = { search?: string } | null;

export function BackToSearch() {
  const location = useLocation();
  const search = (location.state as BackState)?.search ?? '';

  return (
    <Link
      to={`${SEARCH_PATH}${search}`}
      className="inline-flex w-max items-center gap-sm font-semibold text-caption text-primary hover:text-primary-press"
    >
      <ArrowLeft size={icon.size.sm} strokeWidth={icon.strokeWidth} aria-hidden />
      {search ? 'Voltar para os resultados' : 'Voltar para a busca'}
    </Link>
  );
}

export function AccountNotFound() {
  return (
    <div className="flex flex-col gap-xl px-lg py-xl lg:px-xxl">
      <BackToSearch />
      <EmptyNotice
        mood="confused"
        title="Conta não encontrada"
        text="O endereço pode estar incompleto ou a conta não existe mais."
        action={<Button label="Ir para a busca" variant="outline" to={SEARCH_PATH} />}
      />
    </div>
  );
}

export type InfoItem = { label: string; value: ReactNode; sensitive?: boolean };

export function InfoCard({ title, items }: { title: string; items: InfoItem[] }) {
  return (
    <section className="flex flex-col gap-md rounded-card border border-border bg-surface p-lg">
      <h2 className="font-display font-semibold text-subtitle text-ink">{title}</h2>
      <dl className="flex flex-col">
        {items.map((item) => (
          <div key={item.label} className="flex flex-col gap-xs border-b border-border py-sm last:border-b-0">
            <dt className="text-caption text-ink-muted">{item.label}</dt>
            <dd className={`break-words text-ink ${item.sensitive ? 'sensitive' : ''}`}>{item.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export function SectionCard({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <section className="flex min-w-zero flex-col gap-lg rounded-card border border-border bg-surface p-lg">
      <div className="flex flex-col gap-xs">
        <h2 className="font-display font-semibold text-subtitle text-ink">{title}</h2>
        {description ? <p className="text-caption text-ink-muted">{description}</p> : null}
      </div>
      {children}
    </section>
  );
}

const ACTION_STYLE = {
  suspend: { Icon: Ban, className: 'bg-disagree-dim text-disagree' },
  reactivate: { Icon: RotateCcw, className: 'bg-agree-dim text-agree' },
};

export function AccessHistory({ events }: { events: AccessEvent[] }) {
  return (
    <SectionCard title="Histórico de acesso" description="Toda suspensão e reativação fica registrada, com o motivo e quem fez.">
      {events.length === 0 ? (
        <p className="text-caption text-ink-muted">O acesso desta conta nunca foi suspenso.</p>
      ) : (
        <ol className="flex flex-col">
          {events.map((event) => {
            const { Icon, className } = ACTION_STYLE[event.action];
            return (
              <li key={event.id} className="flex gap-md border-b border-border py-md first:pt-zero last:border-b-0 last:pb-zero">
                <span className={`flex h-avatar-sm w-avatar-sm shrink-0 items-center justify-center rounded-pill ${className}`}>
                  <Icon size={icon.size.sm} strokeWidth={icon.strokeWidth} aria-hidden />
                </span>
                <div className="flex min-w-zero flex-col gap-xs">
                  <span className="font-semibold text-ink">
                    {ACCESS_ACTION_LABEL[event.action]} · {ACCESS_REASON_LABEL[event.reason]}
                  </span>
                  <p className="text-ink">{event.note}</p>
                  <span className="text-caption text-ink-muted">
                    {event.by} · {formatDateTime(event.createdAt)}
                  </span>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </SectionCard>
  );
}
