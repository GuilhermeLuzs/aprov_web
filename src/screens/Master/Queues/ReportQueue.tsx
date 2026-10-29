import { useCallback, useState } from 'react';
import { EmptyNotice, FilterSelect, Tabs } from '../../../components';
import { useQueues } from '../../../store/queues';
import { useAccountName } from '../../../store/session';
import { REPORT_REASON_LABEL, REPORT_TARGET_LABEL, type ReportReason, type ReportTargetKind } from '../../../types';
import {
  DEFAULT_CASE_FILTERS,
  OWNER_OPTIONS,
  buildCases,
  filterCases,
  sortCases,
  type CaseFilters,
  type CaseSort,
  type OwnerFilter,
  type ReportCase,
} from '../../../utils/queues';
import { AgeLabel, CountPill } from './QueueParts';
import { ReportCaseModal } from './ReportCaseModal';
import { useTargetInfo } from './useTargetInfo';

const KIND_OPTIONS = (Object.keys(REPORT_TARGET_LABEL) as ReportTargetKind[]).map((value) => ({
  value,
  label: value === 'review' ? 'Avaliações' : 'Itens do catálogo',
}));

const REASON_OPTIONS = (Object.keys(REPORT_REASON_LABEL) as ReportReason[]).map((value) => ({
  value,
  label: REPORT_REASON_LABEL[value],
}));

const SORT_OPTIONS = [{ value: 'mostReported', label: 'Mais denunciadas primeiro' }];

function CaseRow({ reportCase, me, onOpen }: { reportCase: ReportCase; me: string; onOpen: () => void }) {
  const info = useTargetInfo()(reportCase.target);
  const nameOf = useAccountName();
  const resolved = reportCase.resolution && !reportCase.pending;
  return (
    <li>
      <button
        type="button"
        onClick={onOpen}
        className="flex w-full flex-col gap-sm rounded-card border border-border bg-surface p-lg text-left transition-colors hover:border-primary"
      >
        <div className="flex flex-wrap items-center gap-sm">
          <span className="rounded-pill bg-surface-alt px-sm py-xs font-semibold text-caption text-ink">
            {REPORT_TARGET_LABEL[reportCase.target.kind]}
          </span>
          <CountPill count={reportCase.reports.length} singular="denúncia" plural="denúncias" />
          <span className="text-caption text-ink-muted">
            {reportCase.reasons.map((entry) => REPORT_REASON_LABEL[entry.reason]).join(', ')}
          </span>
        </div>
        <span className="sensitive font-semibold text-ink">{info.title}</span>
        {info.text ? <span className="sensitive line-clamp-2 text-ink-muted">{info.text}</span> : null}
        <div className="flex flex-wrap items-center justify-between gap-sm">
          <span className="sensitive text-caption text-ink-muted">{info.context}</span>
          <div className="flex flex-wrap items-center gap-md">
            {resolved ? (
              <span className="text-caption text-ink-muted">
                {reportCase.resolution?.decision === 'removed' ? 'Removido' : 'Mantido'} por {nameOf(reportCase.resolution?.byId ?? '')}
              </span>
            ) : (
              <>
                <span className="text-caption text-ink-muted">
                  {reportCase.assignee ? `Com ${reportCase.assignee === me ? 'você' : nameOf(reportCase.assignee)}` : 'Sem responsável'}
                </span>
                <AgeLabel since={reportCase.openedAt} />
              </>
            )}
          </div>
        </div>
      </button>
    </li>
  );
}

export function ReportQueue({ me }: { me: string }) {
  const { reports, resolutions, assignments } = useQueues();
  const [filters, setFilters] = useState<CaseFilters>(DEFAULT_CASE_FILTERS);
  const [sort, setSort] = useState<CaseSort>('oldest');
  const [openKey, setOpenKey] = useState<string | null>(null);

  const cases = buildCases(reports, resolutions, assignments);
  const pendingCount = cases.filter((c) => c.pending).length;
  const visible = sortCases(filterCases(cases, filters, me), sort, filters.status);
  const openCase = cases.find((c) => c.key === openKey);

  const update = (change: Partial<CaseFilters>) => setFilters((current) => ({ ...current, ...change }));
  const close = useCallback(() => setOpenKey(null), []);

  const openNext = (decidedKey: string) => {
    const index = visible.findIndex((c) => c.key === decidedKey);
    const next = [...visible.slice(index + 1), ...visible.slice(0, index)].find((c) => c.pending);
    setOpenKey(next?.key ?? null);
  };

  return (
    <div className="flex flex-col gap-lg">
      <div className="flex flex-col gap-md xl:flex-row xl:items-center xl:justify-between">
        <Tabs
          label="Situação"
          size="sm"
          value={filters.status}
          onChange={(status) => update({ status })}
          tabs={[
            { key: 'pending', label: `Pendentes · ${pendingCount}` },
            { key: 'resolved', label: 'Resolvidas' },
          ]}
        />
        <div className="grid gap-md sm:grid-cols-2 xl:flex xl:flex-wrap">
          <FilterSelect label="Tipo" value={filters.kind} onChange={(kind) => update({ kind: kind as ReportTargetKind | '' })} allLabel="Todos os tipos" options={KIND_OPTIONS} />
          <FilterSelect
            label="Motivo"
            value={filters.reason}
            onChange={(reason) => update({ reason: reason as ReportReason | '' })}
            allLabel="Todos os motivos"
            options={REASON_OPTIONS}
          />
          <FilterSelect
            label="Responsável"
            value={filters.owner}
            onChange={(owner) => update({ owner: owner as OwnerFilter })}
            allLabel="Qualquer responsável"
            options={OWNER_OPTIONS}
          />
          {filters.status === 'pending' ? (
            <FilterSelect
              label="Ordem"
              value={sort === 'oldest' ? '' : sort}
              onChange={(value) => setSort(value === '' ? 'oldest' : (value as CaseSort))}
              allLabel="Mais antigas primeiro"
              options={SORT_OPTIONS}
            />
          ) : null}
        </div>
      </div>

      {visible.length === 0 ? (
        <EmptyNotice
          mood={filters.status === 'pending' && pendingCount === 0 ? 'starry' : 'confused'}
          title={filters.status === 'pending' && pendingCount === 0 ? 'Nenhuma denúncia pendente' : 'Nada com esses filtros'}
          text={
            filters.status === 'pending' && pendingCount === 0
              ? 'A fila está em dia. Novas denúncias aparecem aqui assim que chegarem.'
              : 'Tire algum filtro para ver mais denúncias.'
          }
        />
      ) : (
        <ul className="flex flex-col gap-md">
          {visible.map((reportCase) => (
            <CaseRow key={reportCase.key} reportCase={reportCase} me={me} onOpen={() => setOpenKey(reportCase.key)} />
          ))}
        </ul>
      )}

      {openCase ? <ReportCaseModal key={openCase.key} reportCase={openCase} me={me} onClose={close} onDecided={openNext} /> : null}
    </div>
  );
}
