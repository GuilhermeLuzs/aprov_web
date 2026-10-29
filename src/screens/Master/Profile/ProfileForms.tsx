import { useState, type SubmitEvent } from 'react';
import { Button, TextField } from '../../../components';
import { changePassword, updateProfile } from '../../../store/session';
import { showToast } from '../../../store/toasts';
import type { Account } from '../../../types';
import { isValidEmail, isValidPassword } from '../../../utils/validation';

const MIN_NAME_LENGTH = 3;

const CARD = 'flex flex-col gap-lg rounded-card border border-border bg-surface p-lg';

function CardHeading({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex flex-col gap-xs">
      <h2 className="font-display font-semibold text-subtitle text-ink">{title}</h2>
      <p className="text-caption text-ink-muted">{description}</p>
    </div>
  );
}

export function ProfileDataForm({ account }: { account: Account }) {
  const [name, setName] = useState(account.name);
  const [email, setEmail] = useState(account.email);
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});
  const changed = name.trim() !== account.name || email.trim() !== account.email;

  const submit = (event: SubmitEvent) => {
    event.preventDefault();
    const found: typeof errors = {};
    if (name.trim().length < MIN_NAME_LENGTH) found.name = 'Informe o nome, com pelo menos 3 letras.';
    if (!isValidEmail(email)) found.email = 'Informe um e-mail válido.';
    if (found.name || found.email) {
      setErrors(found);
      return;
    }
    const result = updateProfile(account.id, { name, email });
    if (!result.ok) {
      setErrors({ email: 'Este e-mail já é usado por outra conta.' });
      return;
    }
    showToast('success', 'Dados do perfil atualizados.');
  };

  return (
    <form onSubmit={submit} noValidate className={CARD}>
      <CardHeading title="Dados do perfil" description="Seu nome aparece no histórico das ações que você faz no painel." />
      <TextField
        label="Nome"
        autoComplete="name"
        value={name}
        onChange={(value) => {
          setName(value);
          setErrors((current) => ({ ...current, name: undefined }));
        }}
        error={errors.name}
      />
      <TextField
        label="E-mail"
        type="email"
        inputMode="email"
        autoComplete="email"
        value={email}
        onChange={(value) => {
          setEmail(value);
          setErrors((current) => ({ ...current, email: undefined }));
        }}
        hint="É com ele que você entra no painel."
        error={errors.email}
        sensitive
      />
      <div className="flex justify-end">
        <Button label="Salvar dados" type="submit" disabled={!changed} />
      </div>
    </form>
  );
}

type PasswordErrors = { current?: string; next?: string; confirmation?: string };

export function PasswordForm({ account }: { account: Account }) {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [errors, setErrors] = useState<PasswordErrors>({});
  const filled = current !== '' && next !== '' && confirmation !== '';

  const clearError = (key: keyof PasswordErrors) => setErrors((found) => ({ ...found, [key]: undefined }));

  const submit = (event: SubmitEvent) => {
    event.preventDefault();
    const found: PasswordErrors = {};
    if (!isValidPassword(next)) found.next = 'A senha precisa ter 8 ou mais caracteres, com letra e número.';
    else if (next === current) found.next = 'A nova senha precisa ser diferente da atual.';
    if (confirmation !== next) found.confirmation = 'As senhas não são iguais.';
    if (found.next || found.confirmation) {
      setErrors(found);
      return;
    }
    if (!changePassword(account.id, current, next)) {
      setErrors({ current: 'Senha atual incorreta.' });
      return;
    }
    setCurrent('');
    setNext('');
    setConfirmation('');
    showToast('success', 'Senha alterada. Use a nova senha no próximo acesso.');
  };

  return (
    <form onSubmit={submit} noValidate className={CARD}>
      <CardHeading title="Senha" description="Para trocar, confirme a senha atual." />
      <TextField
        label="Senha atual"
        type="password"
        autoComplete="current-password"
        revealable
        value={current}
        onChange={(value) => {
          setCurrent(value);
          clearError('current');
        }}
        error={errors.current}
      />
      <TextField
        label="Nova senha"
        type="password"
        autoComplete="new-password"
        revealable
        value={next}
        onChange={(value) => {
          setNext(value);
          clearError('next');
        }}
        hint="Pelo menos 8 caracteres, com letra e número."
        error={errors.next}
      />
      <TextField
        label="Repita a nova senha"
        type="password"
        autoComplete="new-password"
        revealable
        value={confirmation}
        onChange={(value) => {
          setConfirmation(value);
          clearError('confirmation');
        }}
        error={errors.confirmation}
      />
      <div className="flex justify-end">
        <Button label="Trocar senha" type="submit" disabled={!filled} />
      </div>
    </form>
  );
}
