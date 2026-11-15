import { useState, type SubmitEvent } from 'react';
import { Link, useNavigate } from 'react-router';
import { Check } from 'lucide-react';
import { Button, FormCard, SelectField, Stepper, TextField } from '../../../components';
import { lookupZipCode } from '../../../api';
import { registerCompany } from '../../../store/session';
import { icon } from '../../../theme';
import { CATEGORY_LABEL, COMPANY_SIZE_LABEL, MODALITY_LABEL, type Category, type CompanySize, type Modality } from '../../../types';
import { formatCep, formatCnpj, formatCpf, formatPhone, isValidCep, onlyDigits, passwordRules } from '../../../utils/validation';
import {
  CNPJ_TAKEN,
  STEP_LABELS,
  emptyForm,
  formErrorsFromServer,
  stepErrors,
  stepOfErrors,
  toPayload,
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
  const [sending, setSending] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [lookingUp, setLookingUp] = useState(false);

  const update = (patch: Partial<SignUpForm>) => {
    setForm((current) => ({ ...current, ...patch }));
    setErrors((current) => {
      const next = { ...current };
      (Object.keys(patch) as (keyof SignUpForm)[]).forEach((key) => delete next[key]);
      return next;
    });
  };

  const goTo = (next: number, nextErrors: FormErrors = {}) => {
    setStep(next);
    setErrors(nextErrors);
    window.scrollTo({ top: 0 });
  };

  const changeZipCode = async (value: string) => {
    const zipCode = formatCep(value);
    update({ zipCode });
    if (!isValidCep(zipCode)) return;
    setLookingUp(true);
    const address = await lookupZipCode(onlyDigits(zipCode));
    setLookingUp(false);
    if (address) update(address);
  };

  const submit = async (event: SubmitEvent) => {
    event.preventDefault();
    setSubmitError(null);
    const found = stepErrors(step, form);
    if (Object.keys(found).length > 0) {
      setErrors(found);
      return;
    }
    if (step < STEP_LABELS.length) {
      goTo(step + 1);
      return;
    }
    const payload = toPayload(form);
    if (!payload) return;
    setSending(true);
    const result = await registerCompany(payload);
    setSending(false);
    if (!result.ok) {
      const serverErrors = formErrorsFromServer(result.errors);
      if (Object.keys(serverErrors).length > 0) {
        goTo(stepOfErrors(serverErrors), serverErrors);
        return;
      }
      setSubmitError(result.message);
      return;
    }
    navigate('/login', { state: { registeredEmail: payload.responsibleEmail } });
  };

  const rules = passwordRules(form.password);

  return (
    <FormCard
      width="wide"
      title="Cadastrar empresa"
      description="Com o cadastro, sua empresa entra na APROV e passa a receber avaliações dos clientes."
    >
      <Stepper current={step} labels={STEP_LABELS} />

      <form onSubmit={(event) => void submit(event)} className="flex flex-col gap-lg" noValidate>
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
            <TextField
              label="CEP"
              inputMode="numeric"
              autoComplete="postal-code"
              placeholder="00000-000"
              value={form.zipCode}
              onChange={(value) => void changeZipCode(value)}
              hint={lookingUp ? 'Buscando o endereço...' : 'Preenche rua, bairro e cidade.'}
              error={errors.zipCode}
            />
            <div className="lg:col-span-2">
              <TextField
                label="Rua"
                autoComplete="address-line1"
                value={form.street}
                onChange={(value) => update({ street: value })}
                error={errors.street}
              />
            </div>
            <TextField
              label="Número"
              value={form.number}
              onChange={(value) => update({ number: value })}
              error={errors.number}
            />
            <TextField
              label="Complemento"
              autoComplete="address-line2"
              placeholder="Opcional"
              value={form.complement}
              onChange={(value) => update({ complement: value })}
              error={errors.complement}
            />
            <TextField
              label="Bairro"
              value={form.district}
              onChange={(value) => update({ district: value })}
              error={errors.district}
            />
            <TextField
              label="Cidade"
              autoComplete="address-level2"
              value={form.city}
              onChange={(value) => update({ city: value })}
              error={errors.city}
            />
            <TextField
              label="UF"
              autoComplete="address-level1"
              placeholder="SP"
              value={form.state}
              onChange={(value) => update({ state: value.toUpperCase().slice(0, 2) })}
              error={errors.state}
            />
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
          <Button
            label={step < STEP_LABELS.length ? 'Continuar' : sending ? 'Cadastrando...' : 'Concluir cadastro'}
            type="submit"
            disabled={sending}
          />
        </div>
        {submitError ? <p className="text-center text-caption font-semibold text-disagree">{submitError}</p> : null}
      </form>

    </FormCard>
  );
}
