import { useState, type SubmitEvent } from 'react';
import { useNavigate } from 'react-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, CompanyAvatar, LoadingNotice, Modal, SelectField, TextAreaField, TextField } from '../../../components';
import {
  ApiError,
  apiDeactivateCompany,
  apiPanelMe,
  apiUpdateCompany,
  lookupZipCode,
  type ApiPanelCompany,
  type CompanyUpdatePayload,
} from '../../../api';
import { MODALITY_TO_API, SIZE_TO_API, restoreSession, signOut, useCurrentAccount } from '../../../store/session';
import { showToast } from '../../../store/toasts';
import { CATEGORY_LABEL, COMPANY_SIZE_LABEL, MODALITY_LABEL, type Category, type CompanySize, type Modality } from '../../../types';
import { formatCep, formatPhone, isValidCep, onlyDigits } from '../../../utils/validation';
import { PasswordForm, ProfileDataForm } from '../../Master/Profile/ProfileForms';

type Errors = Record<string, string>;

const DESCRIPTION_MAX = 500;

const MODALITY_FROM_API = Object.fromEntries(Object.entries(MODALITY_TO_API).map(([web, api]) => [api, web])) as Record<string, Modality>;
const SIZE_FROM_API = Object.fromEntries(Object.entries(SIZE_TO_API).map(([web, api]) => [api, web])) as Record<string, CompanySize>;

const options = <T extends string>(labels: Record<T, string>) => (Object.keys(labels) as T[]).map((value) => ({ value, label: labels[value] }));

function Card({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <section className="flex min-w-zero flex-col gap-lg rounded-card border border-border bg-surface p-lg">
      <div className="flex flex-col gap-xs">
        <h2 className="font-display font-semibold text-subtitle text-ink">{title}</h2>
        <p className="text-caption text-ink-muted">{description}</p>
      </div>
      {children}
    </section>
  );
}

function formOf(company: ApiPanelCompany) {
  return {
    name: company.name,
    email: company.email,
    phone: formatPhone(company.phone),
    zipCode: formatCep(company.zipCode),
    street: company.street,
    number: company.number,
    complement: company.complement ?? '',
    district: company.district,
    city: company.city,
    state: company.state,
    niche: company.niche as Category,
    modality: MODALITY_FROM_API[company.modality],
    size: SIZE_FROM_API[company.size],
    description: company.description ?? '',
    responsibleName: company.responsibleName,
    responsiblePhone: formatPhone(company.responsiblePhone),
  };
}

type CompanyForm = ReturnType<typeof formOf>;

function CompanyDataForm({ company }: { company: ApiPanelCompany }) {
  const client = useQueryClient();
  const [form, setForm] = useState<CompanyForm>(() => formOf(company));
  const [errors, setErrors] = useState<Errors>({});
  const [saving, setSaving] = useState(false);
  const update = (change: Partial<CompanyForm>) => setForm((current) => ({ ...current, ...change }));
  const field = (key: keyof CompanyForm) => ({ value: form[key], error: errors[key], onChange: (value: string) => update({ [key]: value }) });

  const changeZipCode = async (value: string) => {
    const zipCode = formatCep(value);
    update({ zipCode });
    if (!isValidCep(zipCode)) return;
    const address = await lookupZipCode(onlyDigits(zipCode));
    if (address) update(address);
  };

  const submit = async (event: SubmitEvent) => {
    event.preventDefault();
    const payload: CompanyUpdatePayload = {
      ...form,
      phone: onlyDigits(form.phone),
      zipCode: onlyDigits(form.zipCode),
      state: form.state.trim().toUpperCase(),
      modality: MODALITY_TO_API[form.modality],
      size: SIZE_TO_API[form.size],
      responsiblePhone: onlyDigits(form.responsiblePhone),
    };
    setSaving(true);
    try {
      await apiUpdateCompany(payload);
      setErrors({});
      await restoreSession();
      void client.invalidateQueries({ queryKey: ['panel', 'me'] });
      showToast('success', 'Dados da empresa salvos.');
    } catch (error) {
      if (error instanceof ApiError) setErrors(Object.fromEntries(Object.entries(error.errors).map(([key, list]) => [key, list[0] ?? ''])));
      showToast('error', error instanceof ApiError ? error.message : 'Não deu para salvar agora. Tente de novo.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} noValidate>
      <Card title="Dados da empresa" description="O que os clientes veem no app e o que a APROV usa para falar com vocês.">
        <div className="grid gap-lg sm:grid-cols-2">
          <TextField label="Nome da empresa" {...field('name')} sensitive />
          <TextField label="E-mail de contato" {...field('email')} />
          <TextField label="Telefone" {...field('phone')} onChange={(value) => update({ phone: formatPhone(value) })} />
          <TextField label="CEP" {...field('zipCode')} onChange={(value) => void changeZipCode(value)} inputMode="numeric" />
          <TextField label="Rua" {...field('street')} />
          <div className="grid grid-cols-2 gap-lg">
            <TextField label="Número" {...field('number')} />
            <TextField label="Complemento (opcional)" {...field('complement')} />
          </div>
          <TextField label="Bairro" {...field('district')} />
          <div className="grid grid-cols-2 gap-lg">
            <TextField label="Cidade" {...field('city')} />
            <TextField label="UF" {...field('state')} />
          </div>
          <SelectField label="Nicho" placeholder="Escolha" options={options(CATEGORY_LABEL)} {...field('niche')} />
          <SelectField label="Modalidade" placeholder="Escolha" options={options(MODALITY_LABEL)} {...field('modality')} />
          <SelectField label="Porte" placeholder="Escolha" options={options(COMPANY_SIZE_LABEL)} {...field('size')} />
          <TextField label="Nome do responsável" {...field('responsibleName')} sensitive />
          <TextField label="Telefone do responsável" {...field('responsiblePhone')} onChange={(value) => update({ responsiblePhone: formatPhone(value) })} />
        </div>
        <TextAreaField label="Descrição" value={form.description} onChange={(value) => update({ description: value })} maxLength={DESCRIPTION_MAX} rows={3} error={errors.description} />
        <div className="flex justify-end">
          <Button label={saving ? 'Salvando...' : 'Salvar dados da empresa'} type="submit" disabled={saving} />
        </div>
      </Card>
    </form>
  );
}

function DeactivateCard() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [sending, setSending] = useState(false);

  const confirm = async () => {
    setSending(true);
    try {
      await apiDeactivateCompany(password);
      await signOut();
      navigate('/login', { replace: true });
    } catch (failure) {
      setError(failure instanceof ApiError ? (failure.errors.password?.[0] ?? failure.message) : 'Não deu para desativar agora. Tente de novo.');
    } finally {
      setSending(false);
    }
  };

  return (
    <Card title="Desativar a conta" description="A empresa sai do app, os itens e cupons deixam de aparecer e ninguém mais entra neste painel. Para voltar, fale com o suporte da APROV.">
      <div>
        <Button label="Desativar a conta da empresa" variant="outline" onClick={() => setOpen(true)} />
      </div>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Desativar a conta da empresa?"
        size="sm"
        footer={
          <>
            <Button label="Cancelar" variant="text" onClick={() => setOpen(false)} />
            <Button label={sending ? 'Desativando...' : 'Desativar'} onClick={() => void confirm()} disabled={sending || !password} />
          </>
        }
      >
        <TextField label="Confirme com a sua senha" value={password} onChange={setPassword} type="password" error={error} />
      </Modal>
    </Card>
  );
}

export default function CompanyProfileScreen() {
  const account = useCurrentAccount();
  const me = useQuery({ queryKey: ['panel', 'me'], queryFn: apiPanelMe });
  const company = me.data?.company;

  if (!account || !company) {
    return (
      <div className="px-lg py-xl lg:px-xxl">
        <LoadingNotice text="Carregando o perfil..." />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-xl px-lg py-xl lg:px-xxl">
      <div className="flex flex-wrap items-center gap-lg">
        <CompanyAvatar name={company.name} imageUrl={company.logoUrl ?? undefined} />
        <div className="flex min-w-zero flex-col gap-xs">
          <h1 className="sensitive font-display font-bold text-display text-ink">{company.name}</h1>
          <p className="text-ink-muted">
            Empresa parceira · <span className="sensitive">{account.email}</span>
          </p>
        </div>
      </div>
      <CompanyDataForm key={company.name} company={company} />
      <div className="grid items-start gap-lg lg:grid-cols-2">
        <ProfileDataForm key={`${account.name}-${account.email}`} account={account} />
        <PasswordForm />
      </div>
      <DeactivateCard />
    </div>
  );
}
