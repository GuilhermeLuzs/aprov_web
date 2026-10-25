import { useState, type SubmitEvent } from 'react';
import { Link, useNavigate } from 'react-router';
import { Check } from 'lucide-react';
import { Button, FormCard, SelectField, Stepper, TextField } from '../../../components';
import { registerCompany } from '../../../store/session';
import { icon } from '../../../theme';
import { CATEGORY_LABEL, COMPANY_SIZE_LABEL, MODALITY_LABEL, type Category, type CompanySize, type Modality } from '../../../types';
import { formatCnpj, formatCpf, formatPhone, passwordRules } from '../../../utils/validation';
import {
  CNPJ_TAKEN,
  EMAIL_TAKEN,
  STEP_LABELS,
  emptyForm,
  stepErrors,
  toRegistration,
  type FormErrors,
  type SignUpForm,
} from './form';

function optionsOf<T extends string>(labels: Record<T, string>) {
  return (Object.keys(labels) as T[]).map((value) => ({ value, label: labels[value] }));
}

const CATEGORY_OPTIONS = optionsOf<Category>(CATEGORY_LABEL);
const MODALITY_OPTIONS = optionsOf<Modality>(MODALITY_LABEL);
const SIZE_OPTIONS = optionsOf<CompanySize>(COMPANY_SIZE_LABEL);

const PASSWORD_RULES: { key: keyof ReturnType<typeof passwordRules>; label: string }[] = [
  { key: 'length', label: '8 ou mais caracteres' },
  { key: 'letter', label: 'Pelo menos uma letra' },
  { key: 'number', label: 'Pelo menos um número' },
];

export default function CompanySignUpScreen() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<SignUpForm>(emptyForm);
  const [errors, setErrors] = useState<FormErrors>({});

  const update = (patch: Partial<SignUpForm>) => {
    setForm((current) => ({ ...current, ...patch }));
    setErrors((current) => {
      const next = { ...current };
      (Object.keys(patch) as (keyof SignUpForm)[]).forEach((key) => delete next[key]);
      return next;
    });
  };

  const goTo = (next: number) => {
    setStep(next);
    setErrors({});
    window.scrollTo({ top: 0 });
  };

  const submit = (event: SubmitEvent) => {
    event.preventDefault();
    const found = stepErrors(step, form);
    if (Object.keys(found).length > 0) {
      setErrors(found);
      return;
    }
    if (step < STEP_LABELS.length) {
      goTo(step + 1);
      return;
    }
    const registration = toRegistration(form);
    if (!registration) return;
    const result = registerCompany(registration);
    if (!result.ok) {
      goTo(result.reason === 'cnpj' ? 1 : 2);
      setErrors(result.reason === 'cnpj' ? { cnpj: CNPJ_TAKEN } : { responsibleEmail: EMAIL_TAKEN });
      return;
    }
    navigate('/login', { state: { registeredEmail: registration.responsible.email } });
  };

  const rules = passwordRules(form.password);

  return (
    <FormCard
      width="wide"
      title="Cadastrar empresa"
      description="Com o cadastro, sua empresa entra na APROV e passa a receber avaliações dos clientes."
    >
      <Stepper current={step} labels={STEP_LABELS} />

      <form onSubmit={submit} className="flex flex-col gap-lg" noValidate>
        {step === 1 ? (
          <div className="grid gap-x-lg gap-y-md md:grid-cols-2 lg:grid-cols-4">
            <TextField
              label="CNPJ"
              inputMode="numeric"
              placeholder="00.000.000/0000-00"
              value={form.cnpj}
              onChange={(value) => update({ cnpj: formatCnpj(value) })}
              error={errors.cnpj}
            />
            <div className="lg:col-span-2">
              <TextField
                label="Nome da empresa"
                autoComplete="organization"
                value={form.name}
                onChange={(value) => update({ name: value })}
                error={errors.name}
              />
            </div>
            <TextField
              label="Telefone da empresa"
              type="tel"
              inputMode="tel"
              placeholder="(00) 0000-0000"
              value={form.phone}
              onChange={(value) => update({ phone: formatPhone(value) })}
              error={errors.phone}
            />
            <div className="lg:col-span-2">
              <TextField
                label="Endereço"
                autoComplete="street-address"
                placeholder="Rua, número, cidade e estado"
                value={form.address}
                onChange={(value) => update({ address: value })}
                error={errors.address}
              />
            </div>
            <div className="lg:col-span-2">
              <TextField
                label="E-mail da empresa"
                type="email"
                inputMode="email"
                placeholder="contato@empresa.com"
                value={form.email}
                onChange={(value) => update({ email: value })}
                error={errors.email}
              />
            </div>
            <SelectField
              label="Nicho"
              placeholder="Escolha o nicho"
              options={CATEGORY_OPTIONS}
              value={form.category}
              onChange={(value) => update({ category: value as Category })}
              error={errors.category}
            />
            <SelectField
              label="Modalidade"
              placeholder="Escolha"
              options={MODALITY_OPTIONS}
              value={form.modality}
              onChange={(value) => update({ modality: value as Modality })}
              error={errors.modality}
            />
            <div className="lg:col-span-2">
              <SelectField
                label="Porte"
                placeholder="Quantos colaboradores a empresa tem?"
                options={SIZE_OPTIONS}
                value={form.size}
                onChange={(value) => update({ size: value as CompanySize })}
                error={errors.size}
              />
            </div>
            {errors.cnpj === CNPJ_TAKEN ? (
              <p className="text-caption text-ink-muted md:col-span-2 lg:col-span-4">
                Se a empresa já é parceira,{' '}
                <Link to="/login" className="font-semibold text-primary hover:text-primary-press">
                  entre na conta
                </Link>{' '}
                ou{' '}
                <Link to="/recuperar-senha" className="font-semibold text-primary hover:text-primary-press">
                  recupere a senha
                </Link>
                .
              </p>
            ) : null}
          </div>
        ) : null}

        {step === 2 ? (
          <div className="grid gap-x-lg gap-y-md md:grid-cols-2 lg:grid-cols-3">
            <div className="md:col-span-2">
              <TextField
                label="Nome do responsável"
                autoComplete="name"
                value={form.responsibleName}
                onChange={(value) => update({ responsibleName: value })}
                error={errors.responsibleName}
              />
            </div>
            <TextField
              label="CPF do responsável"
              inputMode="numeric"
              placeholder="000.000.000-00"
              value={form.responsibleCpf}
              onChange={(value) => update({ responsibleCpf: formatCpf(value) })}
              error={errors.responsibleCpf}
            />
            <TextField
              label="Telefone do responsável"
              type="tel"
              inputMode="tel"
              placeholder="(00) 00000-0000"
              value={form.responsiblePhone}
              onChange={(value) => update({ responsiblePhone: formatPhone(value) })}
              error={errors.responsiblePhone}
            />
            <div className="md:col-span-2">
              <TextField
                label="E-mail do responsável"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="voce@empresa.com"
                hint="É com este e-mail que você vai entrar no painel."
                value={form.responsibleEmail}
                onChange={(value) => update({ responsibleEmail: value })}
                error={errors.responsibleEmail}
              />
            </div>
          </div>
        ) : null}

        {step === 3 ? (
          <div className="grid gap-x-lg gap-y-md lg:grid-cols-2">
            <TextField
              label="Senha"
              type="password"
              autoComplete="new-password"
              revealable
              value={form.password}
              onChange={(value) => update({ password: value })}
              error={errors.password}
            />
            <TextField
              label="Confirmar senha"
              type="password"
              autoComplete="new-password"
              revealable
              value={form.passwordConfirmation}
              onChange={(value) => update({ passwordConfirmation: value })}
              error={errors.passwordConfirmation}
            />
            <ul className="flex flex-col gap-xs lg:col-span-2" aria-label="Regras da senha">
              {PASSWORD_RULES.map((rule) => (
                <li
                  key={rule.key}
                  className={`flex items-center gap-sm text-caption ${rules[rule.key] ? 'text-agree' : 'text-ink-muted'}`}
                >
                  <Check size={icon.size.sm} strokeWidth={icon.strokeWidth} aria-hidden />
                  {rule.label}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="flex items-center justify-between gap-md">
          {step > 1 ? (
            <Button label="Voltar" variant="text" onClick={() => goTo(step - 1)} />
          ) : (
            <span />
          )}
          <Button label={step < STEP_LABELS.length ? 'Continuar' : 'Concluir cadastro'} type="submit" />
        </div>
      </form>

    </FormCard>
  );
}
