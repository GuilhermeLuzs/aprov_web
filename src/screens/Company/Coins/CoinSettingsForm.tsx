import { useState, type ReactNode, type SubmitEvent } from 'react';
import { Button, CoinBadge, ColorPicker, IconPicker, Tabs, TextField } from '../../../components';
import { coin } from '../../../theme';
import { COIN_ICONS, type CoinSettings, type ProductKind, type RewardRule, type RewardTopic } from '../../../types';
import {
  COIN_NAME_MAX,
  formatReais,
  formatReaisInput,
  fullReviewCoins,
  parseReais,
  validateCoinForm,
  type CoinForm,
  type CoinFormErrors,
} from '../../../utils/coins';
import { formatInt } from '../../../utils/format';
import { RewardTableEditor } from './RewardTableEditor';
import { showToast } from '../../../store/toasts';

type Props = {
  settings: CoinSettings;
  onSave: (settings: CoinSettings) => void;
  toolbar?: ReactNode;
};

const KIND_TABS: { key: ProductKind; label: string }[] = [
  { key: 'product', label: 'Produto' },
  { key: 'service', label: 'Serviço' },
];

const EXAMPLE_AMOUNTS = [100, 500];

function formOf(settings: CoinSettings): CoinForm {
  return {
    name: settings.name,
    color: settings.color,
    icon: settings.icon,
    rewards: settings.rewards,
    valueText: formatReaisInput(settings.valueInReais),
  };
}

function Card({ title, aside, children }: { title: string; aside?: ReactNode; children: ReactNode }) {
  return (
    <section className="flex min-w-zero flex-col gap-md rounded-card border border-border bg-surface p-lg">
      <div className="flex flex-wrap items-center justify-between gap-sm">
        <h2 className="font-display font-semibold text-subtitle text-ink">{title}</h2>
        {aside}
      </div>
      {children}
    </section>
  );
}

export function CoinSettingsForm({ settings, onSave, toolbar }: Props) {
  const [form, setForm] = useState<CoinForm>(() => formOf(settings));
  const [errors, setErrors] = useState<CoinFormErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [kind, setKind] = useState<ProductKind>('product');

  const coinName = form.name.trim() || 'moedas';
  const value = parseReais(form.valueText);
  const validValue = Number.isFinite(value) && value > 0;
  const total = fullReviewCoins(form.rewards[kind], kind);
  const dirty = JSON.stringify(formOf(settings)) !== JSON.stringify(form);
  const errorCount = Object.keys(errors).length - (errors.rewards ? 1 : 0) + Object.keys(errors.rewards ?? {}).length;

  const update = (change: Partial<CoinForm>) => {
    const next = { ...form, ...change };
    setForm(next);
    if (submitted) setErrors(validateCoinForm(next, coin.iconColor, coin.minContrast));
  };

  const updateRule = (topic: RewardTopic, rule: RewardRule) =>
    update({ rewards: { ...form.rewards, [kind]: { ...form.rewards[kind], [topic]: rule } } });

  const submit = (event: SubmitEvent) => {
    event.preventDefault();
    const found = validateCoinForm(form, coin.iconColor, coin.minContrast);
    setSubmitted(true);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      const productErrors = Object.keys(found.rewards ?? {}).some((key) => key.startsWith('product.'));
      if (found.rewards && !productErrors) setKind('service');
      if (found.rewards && productErrors) setKind('product');
      showToast('error', 'Não deu para salvar. Confira os campos marcados.');
      return;
    }
    onSave({
      ...settings,
      name: form.name.trim(),
      color: form.color.trim().toUpperCase(),
      icon: form.icon,
      rewards: form.rewards,
      valueInReais: value,
    });
    setForm((current) => ({
      ...current,
      name: current.name.trim(),
      color: current.color.trim().toUpperCase(),
      valueText: formatReaisInput(value),
    }));
    showToast('success', 'Configuração salva. O app já mostra a moeda assim.');
  };

  const discard = () => {
    setForm(formOf(settings));
    setErrors({});
    setSubmitted(false);
  };

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-lg">
      <div className="flex flex-wrap items-center justify-between gap-md">
        {toolbar}
        <div className="flex gap-md">
          <Button label="Descartar alterações" variant="text" onClick={discard} disabled={!dirty} />
          <Button label="Salvar configuração" type="submit" disabled={!dirty} />
        </div>
      </div>

      {errorCount > 0 ? (
        <p role="alert" className="rounded-control bg-disagree-dim px-md py-sm font-semibold text-disagree">
          {errorCount === 1 ? 'Confira o campo destacado.' : `Confira os ${errorCount} campos destacados.`}
        </p>
      ) : null}

      <div className="grid items-start gap-lg xl:grid-cols-2">
        <Card title="Sua moeda">
          <div className="flex items-center gap-md rounded-control bg-surface-alt px-md py-sm">
            <CoinBadge icon={form.icon} color={form.color} size="md" />
            <div className="flex min-w-zero flex-col">
              <span className="truncate font-display font-semibold text-ink">{form.name.trim() || 'Nome da moeda'}</span>
              <span className="text-caption text-ink-muted">Assim a moeda aparece para o cliente no app.</span>
            </div>
          </div>
          <div className="grid gap-md sm:grid-cols-2">
            <TextField
              label="Nome"
              value={form.name}
              onChange={(name) => update({ name })}
              placeholder="Ex.: PratosVó"
              counter={`${form.name.length}/${COIN_NAME_MAX}`}
              error={errors.name}
            />
            <TextField
              label={`1 ${coinName} vale`}
              value={form.valueText}
              onChange={(valueText) => update({ valueText: valueText.replace(/[^d,]/g, '').slice(0, 8) })}
              inputMode="numeric"
              prefix="R$"
              placeholder="0,10"
              hint={
                validValue
                  ? EXAMPLE_AMOUNTS.map((amount) => `${formatInt(amount)} = ${formatReais(amount * value)}`).join(' · ')
                  : undefined
              }
              error={errors.valueText}
            />
          </div>
          <ColorPicker
            label="Cor"
            value={form.color}
            onChange={(color) => update({ color })}
            presets={coin.presetColors}
            error={errors.color}
          />
          <IconPicker
            label="Ícone"
            value={form.icon}
            onChange={(iconKey) => update({ icon: iconKey })}
            options={COIN_ICONS}
            color={form.color}
          />
        </Card>

        <Card
          title="Quanto cada avaliação rende"
          aside={<Tabs label="Tipo do item" tabs={KIND_TABS} value={kind} onChange={setKind} size="sm" />}
        >
          <RewardTableEditor
            kind={kind}
            table={form.rewards[kind]}
            onChange={updateRule}
            coinName={coinName}
            errors={errors.rewards}
          />
          <p className="rounded-control bg-surface-alt px-md py-sm text-caption text-ink">
            Uma avaliação completa de {kind === 'product' ? 'produto' : 'serviço'} rende{' '}
            <span className="font-semibold">
              {formatInt(total)} {coinName}
            </span>
            {validValue ? ` (${formatReais(total * value)})` : ''}. Com 0, o tópico não rende nada.
          </p>
        </Card>
      </div>
    </form>
  );
}
