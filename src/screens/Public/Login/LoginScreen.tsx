import { useState, type SubmitEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { CircleCheck } from 'lucide-react';
import { Button, FormCard, TextField } from '../../../components';
import { signIn } from '../../../store/session';
import { icon } from '../../../theme';
import { PANEL_PATH } from '../../../types';

type LoginState = { registeredEmail?: string } | null;

export default function LoginScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const registeredEmail = (location.state as LoginState)?.registeredEmail;

  const [email, setEmail] = useState(registeredEmail ?? '');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const canSubmit = email.trim() !== '' && password !== '' && !sending;

  const submit = async (event: SubmitEvent) => {
    event.preventDefault();
    setSending(true);
    const result = await signIn(email, password);
    setSending(false);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    navigate(PANEL_PATH[result.account.role], { replace: true });
  };

  return (
    <FormCard title="Entrar" description="Área das empresas parceiras e da administração da APROV.">
      {registeredEmail ? (
        <p className="flex items-start gap-sm rounded-control bg-agree-dim p-md text-agree">
          <CircleCheck size={icon.size.md} strokeWidth={icon.strokeWidth} className="mt-xs shrink-0" aria-hidden />
          Empresa cadastrada. Entre com o e-mail do responsável e a senha que você criou.
        </p>
      ) : null}

      <form onSubmit={(event) => void submit(event)} className="flex flex-col gap-lg" noValidate>
        <TextField
          label="E-mail"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="voce@empresa.com"
          value={email}
          onChange={(value) => {
            setEmail(value);
            setError(null);
          }}
        />
        <TextField
          label="Senha"
          type="password"
          autoComplete="current-password"
          revealable
          value={password}
          onChange={(value) => {
            setPassword(value);
            setError(null);
          }}
          error={error ?? undefined}
        />
        <Link to="/recuperar-senha" className="self-end font-semibold text-caption text-primary hover:text-primary-press">
          Esqueci minha senha
        </Link>
        <Button label={sending ? 'Entrando...' : 'Entrar'} type="submit" disabled={!canSubmit} fullWidth />
      </form>

      <p className="text-center text-ink-muted">
        Ainda não é parceira?{' '}
        <Link to="/cadastro" className="font-semibold text-primary hover:text-primary-press">
          Cadastrar empresa
        </Link>
      </p>
    </FormCard>
  );
}
