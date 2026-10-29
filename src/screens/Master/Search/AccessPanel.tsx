import { useCallback, useState } from 'react';
import { Button, Modal, SelectField, Switch, TextAreaField } from '../../../components';
import { recordAccessChange } from '../../../store/moderation';
import { useCurrentAccount } from '../../../store/session';
import { showToast } from '../../../store/toasts';
import {
  ACCESS_REASON_LABEL,
  REACTIVATE_REASONS,
  SUSPEND_REASONS,
  type AccessEvent,
  type AccessReason,
  type AccountRef,
} from '../../../types';
import { formatDateTime } from '../../../utils/format';

const NOTE_MIN = 10;
const NOTE_MAX = 500;

const SUSPEND_EFFECT = {
  customer: 'não consegue entrar no app enquanto o acesso estiver suspenso. As avaliações já publicadas continuam visíveis.',
  company: 'não consegue entrar no painel, e os itens dela saem do app enquanto o acesso estiver suspenso.',
};

type ModalProps = { account: AccountRef; name: string; suspending: boolean; onClose: () => void };

function AccessModal({ account, name, suspending, onClose }: ModalProps) {
  const admin = useCurrentAccount();
  const [reason, setReason] = useState('');
  const [note, setNote] = useState('');
  const [errors, setErrors] = useState<{ reason?: string; note?: string }>({});
  const reasons = suspending ? SUSPEND_REASONS[account.kind] : REACTIVATE_REASONS;

  const confirm = () => {
    const found: typeof errors = {};
    if (!reason) found.reason = 'Escolha o motivo.';
    if (note.trim().length < NOTE_MIN) found.note = `Descreva o que aconteceu em pelo menos ${NOTE_MIN} caracteres.`;
    else if (note.length > NOTE_MAX) found.note = `Use no máximo ${NOTE_MAX} caracteres.`;
    setErrors(found);
    if (found.reason || found.note) return;

    recordAccessChange({
      account,
      action: suspending ? 'suspend' : 'reactivate',
      reason: reason as AccessReason,
      note: note.trim(),
      by: admin?.name ?? '',
    });
    showToast('success', suspending ? `Acesso de ${name} suspenso.` : `Acesso de ${name} reativado.`);
    onClose();
  };

  return (
    <Modal
      open
      onClose={onClose}
      size="sm"
      title={suspending ? 'Suspender o acesso?' : 'Reativar o acesso?'}
      footer={
        <>
          <Button label="Cancelar" variant="text" onClick={onClose} />
          <Button label={suspending ? 'Suspender acesso' : 'Reativar acesso'} onClick={confirm} />
        </>
      }
    >
      <p className="text-ink">
        <span className="sensitive font-semibold">{name}</span>{' '}
        {suspending ? SUSPEND_EFFECT[account.kind] : 'volta a ter acesso normalmente. A suspensão continua no histórico.'}
      </p>
      <SelectField
        label="Motivo"
        value={reason}
        onChange={(value) => {
          setReason(value);
          setErrors((current) => ({ ...current, reason: undefined }));
        }}
        options={reasons.map((value) => ({ value, label: ACCESS_REASON_LABEL[value] }))}
        placeholder="Escolha o motivo"
        error={errors.reason}
      />
      <TextAreaField
        label="Nota interna"
        value={note}
        onChange={(value) => {
          setNote(value);
          setErrors((current) => ({ ...current, note: undefined }));
        }}
        maxLength={NOTE_MAX}
        rows={4}
        placeholder="O que aconteceu e o que foi verificado. Só a administração vê."
        error={errors.note}
      />
    </Modal>
  );
}

type Props = { account: AccountRef; name: string; latest: AccessEvent | undefined };

export function AccessPanel({ account, name, latest }: Props) {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  const suspended = latest?.action === 'suspend';

  return (
    <section className="flex flex-col gap-md rounded-card border border-border bg-surface p-lg">
      <h2 className="font-display font-semibold text-subtitle text-ink">Acesso à conta</h2>
      <Switch
        checked={!suspended}
        onChange={() => setOpen(true)}
        label={`Acesso de ${name}`}
        text={suspended ? 'Acesso suspenso' : 'Acesso liberado'}
      />
      {suspended && latest ? (
        <p className="rounded-control bg-disagree-dim p-md text-caption text-ink">
          Suspenso em {formatDateTime(latest.createdAt)} por {latest.by}. Motivo:{' '}
          <span className="font-semibold">{ACCESS_REASON_LABEL[latest.reason]}</span>.
        </p>
      ) : (
        <p className="text-caption text-ink-muted">
          Ao suspender, {account.kind === 'customer' ? 'a pessoa' : 'a empresa'} {SUSPEND_EFFECT[account.kind]}
        </p>
      )}
      {open ? <AccessModal account={account} name={name} suspending={!suspended} onClose={close} /> : null}
    </section>
  );
}
