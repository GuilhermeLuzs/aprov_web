import { useSearchParams } from 'react-router';
import { Tabs } from '../../../components';
import type { AccountKind } from '../../../types';
import { EMPTY_CRITERIA, criteriaFromParams, hasAnchor, kindFromParams, paramsFrom } from '../../../utils/accountSearch';
import { SearchGuide } from './SearchGuide';
import { SearchPanel } from './SearchPanel';
import { SearchResults } from './SearchResults';

const KIND_TABS: { key: AccountKind; label: string }[] = [
  { key: 'customer', label: 'Clientes' },
  { key: 'company', label: 'Empresas parceiras' },
];

export default function AccountSearchScreen() {
  const [params, setParams] = useSearchParams();
  const kind = kindFromParams(params);
  const criteria = criteriaFromParams(params);
  const searchKey = params.toString();

  return (
    <div className="flex flex-col gap-xl px-lg py-xl lg:px-xxl">
      <div className="flex flex-col gap-xs">
        <h1 className="font-display font-bold text-display text-ink">Busca avançada</h1>
        <p className="text-ink-muted">Encontre a conta de um cliente ou de uma empresa parceira para ver os dados e o histórico.</p>
      </div>

      <div className="flex flex-col gap-lg">
        <Tabs label="Tipo de conta" tabs={KIND_TABS} value={kind} onChange={(next) => setParams(paramsFrom(next, EMPTY_CRITERIA))} />
        <SearchPanel key={searchKey} kind={kind} initial={criteria} onSearch={(next) => setParams(paramsFrom(kind, next))} />
      </div>

      {hasAnchor(criteria, kind) ? <SearchResults key={searchKey} kind={kind} criteria={criteria} /> : <SearchGuide kind={kind} />}
    </div>
  );
}
