import { useState } from 'react';
import { Link } from 'react-router';
import { Button, Modal, RatingValue, TextAreaField } from '../../../components';
import { assign, failureMessage, resolveCase } from '../../../store/queues';
import { showToast } from '../../../store/toasts';
import { REPORT_REASON_LABEL, REPORT_TARGET_LABEL, type CaseDecision } from '../../../types';
import { ACCOUNT_PATH } from '../../../utils/accountSearch';
import { formatDateTime, plural } from '../../../utils/format';
import type { ReportCase } from '../../../utils/queues';
import { AgeLabel } from './QueueParts';
import { useAdminName, useTargetInfo } from './useTargetInfo';

const NOTE_MAX = 500;

const DECISION_LABEL: Record<ReportCase['target']['kind'], Record<CaseDecision, string>> = {
  review: { removed: 'Remover avaliação', kept: 'Manter avaliação' },
  comment: { removed: 'Remover comentário', kept: 'Manter comentário' },
};

const DECISION_DONE: Record<ReportCase['target']['kind'], Record<CaseDecision, string>> = {
  review: { removed: 'Avaliação removida', kept: 'Avaliação mantida' },
  comment: { removed: 'Comentário removido', kept: 'Comentário mantido' },
};

type Props = {
  reportCase: ReportCase;
  me: string;
  onClose: () => void;
  onDecided: (key: string) => void;
};

export function ReportCaseModal({ reportCase, me, onClose, onDecided }: Props) {
  const info = useTargetInfo()(reportCase.target);
  const nameOf = useAdminName();
  const [note, setNote] = useState('');
  const { kind } = reportCase.target;
  const { resolution } = reportCase;

  const decide = async (decision: CaseDecision) => {
    if (note.length > NOTE_MAX) return;
    try {
      await resolveCase({ target: reportCase.target, decision, note: note.trim() });
      showToast('success', `${DECISION_DONE[kind][decision]}.`);
      onDecided(reportCase.key);
    } catch (error) {
      showToast('error', failureMessage(error, 'Não deu para decidir agora. Tente de novo.'));
    }
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={`Denúncia de ${REPORT_TARGET_LABEL[kind].toLowerCase()}`}
      subtitle={
        <div className="flex flex-wrap items-center gap-sm text-caption text-ink-muted">
          <span>{plural(reportCase.reports.length, 'denúncia', 'denúncias')}</span>
          <span aria-hidden>·</span>
          <AgeLabel since={reportCase.openedAt} overdueCheck={reportCase.pending} />
        </div>
      }
      footer={
        reportCase.pending ? (
          <>
            <Button label={DECISION_LABEL[kind].kept} variant="text" onClick={() => decide('kept')} />
            <Button label={DECISION_LABEL[kind].removed} onClick={() => decide('removed')} />
          </>
        ) : undefined
      }
    >
      <section className="flex flex-col gap-sm rounded-card border border-border p-lg">
        <div className="flex flex-wrap items-start justify-between gap-md">
          <div className="flex min-w-zero flex-col gap-xs">
            <span className="text-caption text-ink-muted">{kind === 'review' ? 'Avaliação denunciada' : 'Comentário denunciado'}</span>
            <span className="sensitive font-semibold text-ink">{info.title}</span>
            <span className="sensitive text-caption text-ink-muted">{info.context}</span>
          </div>
          {info.rating !== undefined ? <RatingValue average={info.rating} /> : null}
        </div>
        {info.text ? <p className="sensitive rounded-control bg-surface-alt p-md text-ink">{info.text}</p> : null}
        {info.owner ? (
          <span className="text-caption text-ink-muted">
            Autor:{' '}
            <Link
              to={`${ACCOUNT_PATH[info.owner.ref.kind]}/${info.owner.ref.id}`}
              className="sensitive font-semibold text-primary hover:text-primary-press"
            >
              {info.owner.name}
            </Link>{' '}
            · abra a conta para suspender o acesso, se for o caso
          </span>
        ) : null}
      </section>

      <section className="flex flex-col gap-md">
        <div className="flex flex-wrap items-center justify-between gap-md">
          <h3 className="font-semibold text-ink">Denúncias recebidas</h3>
          <div className="flex flex-wrap gap-xs">
            {reportCase.reasons.map((entry) => (
              <span key={entry.reason} className="rounded-pill bg-surface-alt px-sm py-xs text-caption text-ink">
                {REPORT_REASON_LABEL[entry.reason]} · {entry.count}
              </span>
            ))}
          </div>
        </div>
        <ul className="flex flex-col">
          {reportCase.reports.map((report) => (
            <li key={report.id} className="flex flex-col gap-xs border-b border-border py-sm last:border-b-0">
              <div className="flex flex-wrap items-baseline justify-between gap-sm">
                <span className="font-semibold text-ink">{REPORT_REASON_LABEL[report.reason]}</span>
                <span className="text-caption text-ink-muted">{formatDateTime(report.createdAt)}</span>
              </div>
              {report.comment ? <p className="text-ink">{report.comment}</p> : null}
              <span className="sensitive text-caption text-ink-muted">
                por {report.reporterName}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {resolution && !reportCase.pending ? (
        <section className={`flex flex-col gap-xs rounded-control p-md ${resolution.decision === 'removed' ? 'bg-disagree-dim' : 'bg-agree-dim'}`}>
          <span className="font-semibold text-ink">{DECISION_DONE[kind][resolution.decision]}</span>
          {resolution.note ? <p className="text-ink">{resolution.note}</p> : null}
          <span className="text-caption text-ink-muted">
            {nameOf(resolution.byId)} · {formatDateTime(resolution.at)}
          </span>
        </section>
      ) : (
        <section className="flex flex-col gap-md">
          {resolution ? (
            <p className="rounded-control bg-value-dim p-md text-caption text-ink">
              Já tinha sido mantido em {formatDateTime(resolution.at)}, mas recebeu denúncias novas depois disso.
            </p>
          ) : null}
          <div className="flex flex-wrap items-center gap-sm text-caption text-ink-muted">
            {reportCase.assignee ? (
              <span>
                Responsável: <span className="font-semibold text-ink">{reportCase.assignee === me ? 'você' : nameOf(reportCase.assignee)}</span>
              </span>
            ) : (
              <>
                <span>Ninguém assumiu esta denúncia.</span>
                <button
                  type="button"
                  onClick={() => assign('report', reportCase.key, me)}
                  className="font-semibold text-primary hover:text-primary-press"
                >
                  Assumir
                </button>
              </>
            )}
          </div>
          <TextAreaField
            label="Nota da decisão (opcional)"
            value={note}
            onChange={setNote}
            maxLength={NOTE_MAX}
            rows={3}
            placeholder="Por que o conteúdo foi removido ou mantido. Só a administração vê."
            error={note.length > NOTE_MAX ? `Use no máximo ${NOTE_MAX} caracteres.` : undefined}
          />
          <p className="text-caption text-ink-muted">Depois de decidir, a próxima denúncia pendente da fila abre em seguida.</p>
        </section>
      )}
    </Modal>
  );
}
