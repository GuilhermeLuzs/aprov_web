import { useState, type SubmitEvent } from 'react';
import { Button, FilterSelect, SearchField } from '../../../components';
import { customers } from '../../../mocks';
import { useCompanies } from '../../../store/session';
import { CATEGORY_LABEL, COMPANY_SIZE_LABEL, type AccountKind } from '../../../types';
import {
  EMPTY_CRITERIA,
  FILTER_KEYS,
  hasAnchor,
  queryKind,
  ufOf,
  type FilterKey,
  type QueryKind,
  type SearchCriteria,
} from '../../../utils/accountSearch';

type Option = { value: string; label: string };

const PLACEHOLDER: Record<AccountKind, string> = {
  customer: 'Nome, @usuário, e-mail, CPF ou ID',
  company: 'Nome, e-mail, CNPJ ou ID',
};

const DOCUMENT: Record<AccountKind, string> = { customer: 'CPF', company: 'CNPJ' };

function hintFor(query: QueryKind, kind: AccountKind): string | undefined {
  if (query === 'email') return 'Busca exata por e-mail.';
  if (query === 'id') return 'Busca exata por ID da conta.';
  if (query === 'document') return `Busca exata por ${DOCUMENT[kind]}.`;
  if (query === 'username') return 'Busca por nome de usuário que começa assim.';
  if (query === 'name') return kind === 'customer' ? 'Busca por nome.' : 'Busca por nome da empresa.';
  return undefined;
}

function errorFor(query: QueryKind, kind: AccountKind): string | undefined {
  if (query === 'tooShort') return 'Digite pelo menos 3 letras do nome.';
  if (query === 'incompleteDocument') return `O ${DOCUMENT[kind]} precisa ter ${kind === 'customer' ? 11 : 14} números.`;
  return undefined;
}

const STATUS_OPTIONS: Option[] = [
  { value: 'active', label: 'Contas ativas' },
  { value: 'suspended', label: 'Contas suspensas' },
];

const JOINED_OPTIONS: Option[] = [
  { value: '7d', label: 'Cadastro nos últimos 7 dias' },
  { value: '30d', label: 'Cadastro nos últimos 30 dias' },
  { value: '90d', label: 'Cadastro nos últimos 90 dias' },
  { value: 'older', label: 'Cadastro há mais de 90 dias' },
];

const ACTIVITY_OPTIONS: Option[] = [
  { value: 'recent', label: 'Usou o app nos últimos 30 dias' },
  { value: 'idle', label: 'Sem usar o app há mais de 30 dias' },
];

const CATEGORY_OPTIONS: Option[] = Object.entries(CATEGORY_LABEL)
  .map(([value, label]) => ({ value, label }))
  .sort((a, b) => a.label.localeCompare(b.label));

const SIZE_OPTIONS: Option[] = Object.entries(COMPANY_SIZE_LABEL).map(([value, label]) => ({ value, label }));

function ufOptions(ufs: string[]): Option[] {
  return [...new Set(ufs.filter(Boolean))].sort().map((uf) => ({ value: uf, label: uf }));
}

type Props = {
  kind: AccountKind;
  initial: SearchCriteria;
  onSearch: (criteria: SearchCriteria) => void;
};

export function SearchPanel({ kind, initial, onSearch }: Props) {
  const companies = useCompanies();
  const [draft, setDraft] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const query = queryKind(draft.query, kind);
  const hint = hintFor(query, kind);
  const dirty = FILTER_KEYS[kind].some((key) => draft[key] !== '') || draft.query.trim() !== '';

  const filters: Record<FilterKey, { allLabel: string; options: Option[]; label: string }> = {
    status: { label: 'Status', allLabel: 'Qualquer status', options: STATUS_OPTIONS },
    uf: {
      label: 'Estado',
      allLabel: 'Todos os estados',
      options: ufOptions(kind === 'customer' ? customers.map((c) => c.uf) : companies.map(ufOf)),
    },
    joined: { label: 'Data de cadastro', allLabel: 'Qualquer data de cadastro', options: JOINED_OPTIONS },
    activity: { label: 'Atividade', allLabel: 'Qualquer atividade', options: ACTIVITY_OPTIONS },
    category: { label: 'Categoria', allLabel: 'Todas as categorias', options: CATEGORY_OPTIONS },
    size: { label: 'Porte', allLabel: 'Qualquer porte', options: SIZE_OPTIONS },
  };

  const update = (change: Partial<SearchCriteria>) => {
    setDraft((current) => ({ ...current, ...change }));
    setError(null);
  };

  const submit = (event: SubmitEvent) => {
    event.preventDefault();
    const invalid = errorFor(query, kind);
    if (invalid) setError(invalid);
    else if (!hasAnchor(draft, kind)) setError('Digite um identificador ou escolha pelo menos um filtro.');
    else onSearch(draft);
  };

  const clear = () => {
    setDraft(EMPTY_CRITERIA);
    setError(null);
    onSearch(EMPTY_CRITERIA);
  };

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-lg rounded-card border border-border bg-surface p-lg">
      <div className="flex flex-col gap-xs">
        <SearchField
          value={draft.query}
          onChange={(value) => update({ query: value })}
          label={kind === 'customer' ? 'Buscar cliente' : 'Buscar empresa'}
          placeholder={PLACEHOLDER[kind]}
        />
        {error ? (
          <p role="alert" className="text-caption text-disagree">
            {error}
          </p>
        ) : hint ? (
          <p className="text-caption text-ink-muted">{hint}</p>
        ) : null}
      </div>

      <div className="grid gap-md sm:grid-cols-2 xl:grid-cols-4">
        {FILTER_KEYS[kind].map((key) => (
          <FilterSelect
            key={key}
            label={filters[key].label}
            value={draft[key]}
            onChange={(value) => update({ [key]: value })}
            allLabel={filters[key].allLabel}
            options={filters[key].options}
          />
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-end gap-md">
        {dirty || hasAnchor(initial, kind) ? <Button label="Limpar" variant="text" onClick={clear} /> : null}
        <Button label="Buscar" type="submit" />
      </div>
    </form>
  );
}
