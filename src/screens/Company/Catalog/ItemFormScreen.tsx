import { useState, type ReactNode, type SubmitEvent } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router';
import { ArrowLeft, House, MapPin, Monitor } from 'lucide-react';
import {
  AmountUnitField,
  Button,
  ChoiceGroup,
  CityPicker,
  MediaPicker,
  MultiSelectFilter,
  SelectField,
  TextAreaField,
  TextField,
} from '../../../components';
import { loadMunicipalities } from '../../../mocks/municipalities';
import { addProduct, findProduct, updateProduct } from '../../../store/catalog';
import { useCurrentAccount } from '../../../store/session';
import { icon } from '../../../theme';
import {
  CATEGORY_LABEL,
  DURATION_UNIT_LABEL,
  PRODUCT_KIND_LABEL,
  RECURRENCE_LABEL,
  type Category,
  type DurationUnit,
  type ProductKind,
  type Recurrence,
  type ServiceModality,
} from '../../../types';
import {
  BRAND_MAX,
  DESCRIPTION_MAX,
  TITLE_MAX,
  emptyItemForm,
  formFromProduct,
  productFields,
  validateItem,
  type ItemForm,
  type ItemFormErrors,
} from '../../../utils/itemForm';
import { formatCep } from '../../../utils/validation';
import { showToast } from '../../../store/toasts';

const CATALOG_PATH = '/empresa/catalogo';
const DEFAULT_REWARD = 20;

const KIND_BY_SLUG: Record<string, ProductKind> = { produto: 'product', servico: 'service' };

const CATEGORY_OPTIONS = (Object.keys(CATEGORY_LABEL) as Category[]).map((category) => ({
  value: category,
  label: CATEGORY_LABEL[category],
}));

const UNIT_OPTIONS = (Object.keys(DURATION_UNIT_LABEL) as DurationUnit[]).map((unit) => ({
  value: unit,
  label: DURATION_UNIT_LABEL[unit],
}));

const RECURRENCE_OPTIONS = (Object.keys(RECURRENCE_LABEL) as Recurrence[]).map((recurrence) => ({
  value: recurrence,
  label: RECURRENCE_LABEL[recurrence],
}));

const MODALITY_OPTIONS = [
  { value: 'remoto', label: 'Remoto', description: 'Por vídeo, telefone ou internet.', Icon: Monitor },
  { value: 'presencial', label: 'Presencial', description: 'O cliente vai até um endereço seu.', Icon: MapPin },
  { value: 'domicilio', label: 'A domicílio', description: 'Você vai até o cliente.', Icon: House },
];

function FormSection({ title, description, children }: { title: string; description: string; children: ReactNode }) {
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

function focusFirstError() {
  requestAnimationFrame(() => {
    const field = document.querySelector<HTMLElement>('[aria-invalid="true"], [data-field-error="true"]');
    field?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    if (field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement) field.focus({ preventScroll: true });
  });
}

export default function ItemFormScreen() {
  const { kind: kindSlug, id } = useParams();
  const navigate = useNavigate();
  const account = useCurrentAccount();
  const editing = id ? findProduct(id) : undefined;
  const newKind = kindSlug ? KIND_BY_SLUG[kindSlug] : undefined;

  const [form, setForm] = useState<ItemForm>(() => (editing ? formFromProduct(editing) : emptyItemForm(newKind ?? 'product')));
  const [errors, setErrors] = useState<ItemFormErrors>({});
  const [submitted, setSubmitted] = useState(false);

  if (id && (!editing || editing.companyId !== account?.companyId)) return <Navigate to={CATALOG_PATH} replace />;
  if (!id && !newKind) return <Navigate to={CATALOG_PATH} replace />;

  const kindLabel = PRODUCT_KIND_LABEL[form.kind].toLowerCase();
  const isService = form.kind === 'service';
  const title = editing ? `Editar ${kindLabel}` : `Novo ${kindLabel}`;

  const update = (change: Partial<ItemForm>) => {
    const next = { ...form, ...change };
    setForm(next);
    if (submitted) setErrors(validateItem(next));
  };

  const submit = (event: SubmitEvent) => {
    event.preventDefault();
    const found = validateItem(form);
    setSubmitted(true);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      showToast('error', 'Não deu para salvar. Confira os campos marcados.');
      focusFirstError();
      return;
    }
    if (editing) {
      updateProduct({ ...editing, ...productFields(form) });
      showToast('success', `Alterações em "${form.title.trim()}" salvas.`);
      navigate(CATALOG_PATH);
    } else if (account?.companyId) {
      addProduct({
        ...productFields(form),
        companyId: account.companyId,
        status: 'active',
        coinsReward: DEFAULT_REWARD,
        xpReward: DEFAULT_REWARD,
      });
      showToast('success', `${PRODUCT_KIND_LABEL[form.kind]} "${form.title.trim()}" cadastrado e ativo.`);
      navigate(CATALOG_PATH);
    }
  };

  const errorCount = Object.keys(errors).length;
  const submitLabel = editing ? 'Salvar alterações' : `Cadastrar ${kindLabel}`;

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-lg px-lg py-xl lg:px-xxl">
      <div className="flex items-center justify-between gap-lg">
        <div className="flex min-w-zero items-center gap-md">
          <Link
            to={CATALOG_PATH}
            aria-label="Voltar ao catálogo"
            title="Voltar ao catálogo"
            className="flex h-control w-control shrink-0 items-center justify-center rounded-pill text-ink hover:bg-surface-alt"
          >
            <ArrowLeft size={icon.size.lg} strokeWidth={icon.strokeWidth} aria-hidden />
          </Link>
          <div className="flex min-w-zero flex-col">
            <h1 className="font-display font-bold text-display text-ink">{title}</h1>
            <p className="text-caption text-ink-muted">
              {editing
                ? 'As mudanças valem na hora no app, e as avaliações do item continuam as mesmas.'
                : `Depois de salvo, o ${kindLabel} entra ativo e já pode ser avaliado no app.`}
            </p>
          </div>
        </div>
        <div className="hidden shrink-0 gap-md lg:flex">
          <Button label="Cancelar" variant="outline" to={CATALOG_PATH} />
          <Button label={submitLabel} type="submit" />
        </div>
      </div>

      {errorCount > 0 ? (
        <p role="alert" className="rounded-control bg-disagree-dim px-md py-sm font-semibold text-disagree">
          {errorCount === 1 ? 'Confira o campo destacado.' : `Confira os ${errorCount} campos destacados.`}
        </p>
      ) : null}

      <div className={`grid items-start gap-lg lg:grid-cols-2 ${isService ? 'xl:grid-cols-3' : ''}`}>
        <FormSection title={`Sobre o ${kindLabel}`} description="O que o cliente vê no app antes de avaliar.">
          <TextField
            label="Título"
            value={form.title}
            onChange={(value) => update({ title: value })}
            placeholder={isService ? 'Ex.: Aula de massas caseiras' : 'Ex.: Lasanha à bolonhesa congelada 800g'}
            counter={`${form.title.length}/${TITLE_MAX}`}
            error={errors.title}
          />
          <div className={`grid gap-lg ${isService ? '' : 'sm:grid-cols-2'}`}>
            <MultiSelectFilter
              variant="field"
              label="Categorias"
              allLabel="Escolha as categorias"
              pluralLabel="categorias"
              options={CATEGORY_OPTIONS}
              values={form.categories}
              onChange={(values) => update({ categories: values as Category[] })}
              error={errors.categories}
            />
            {!isService ? (
              <TextField
                label="Marca (opcional)"
                value={form.brand}
                onChange={(value) => update({ brand: value })}
                placeholder="Ex.: Cozinha da Vó Marlene"
                counter={`${form.brand.length}/${BRAND_MAX}`}
                error={errors.brand}
              />
            ) : null}
          </div>
          <TextAreaField
            label="Descrição"
            value={form.description}
            onChange={(value) => update({ description: value })}
            maxLength={DESCRIPTION_MAX}
            rows={isService ? 6 : 4}
            placeholder="Conte o que é, o que inclui e o que diferencia."
            error={errors.description}
          />
        </FormSection>

        <FormSection title="Fotos e vídeos" description="A primeira foto aparece na lista e no app.">
          <div data-field-error={errors.media ? true : undefined}>
            <MediaPicker media={form.media} onChange={(media) => update({ media })} error={errors.media} />
          </div>
        </FormSection>

        {isService ? (
          <FormSection title="Como o serviço funciona" description="Duração, frequência e onde ele acontece.">
            <div className="grid gap-lg sm:grid-cols-2">
              <AmountUnitField
                label="Duração"
                amount={form.durationAmount}
                onAmountChange={(value) => update({ durationAmount: value.replace(/\D/g, '').slice(0, 3) })}
                unit={form.durationUnit}
                onUnitChange={(value) => update({ durationUnit: value as DurationUnit })}
                units={UNIT_OPTIONS}
                unitLabel="Unidade da duração"
                placeholder="3"
                error={errors.durationAmount}
              />
              <SelectField
                label="Recorrência"
                value={form.recurrence}
                onChange={(value) => update({ recurrence: value as Recurrence })}
                options={RECURRENCE_OPTIONS}
                placeholder="Escolha"
                error={errors.recurrence}
              />
            </div>
            <div data-field-error={errors.modality ? true : undefined}>
              <ChoiceGroup
                label="Modalidade"
                options={MODALITY_OPTIONS}
                value={form.modality}
                onChange={(value) => update({ modality: value as ServiceModality })}
                error={errors.modality}
                stackOnWide
              />
            </div>
            {form.modality === 'presencial' ? (
              <TextField
                label="CEP do local"
                value={form.cep}
                onChange={(value) => update({ cep: formatCep(value) })}
                inputMode="numeric"
                placeholder="00000-000"
                hint="Onde o cliente vai para receber o serviço."
                error={errors.cep}
              />
            ) : null}
            {form.modality === 'domicilio' ? (
              <CityPicker
                label="Cidades atendidas"
                value={form.cities}
                onChange={(cities) => update({ cities })}
                loadCities={loadMunicipalities}
                error={errors.cities}
              />
            ) : null}
          </FormSection>
        ) : null}
      </div>

      <div className="flex flex-col-reverse gap-md sm:flex-row sm:justify-end lg:hidden">
        <Button label="Cancelar" variant="outline" to={CATALOG_PATH} />
        <Button label={submitLabel} type="submit" />
      </div>
    </form>
  );
}
