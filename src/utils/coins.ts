import {
  REWARD_THRESHOLD,
  REWARD_TOPICS_BY_KIND,
  type CoinSettings,
  type ProductKind,
  type RewardRule,
  type RewardTable,
  type RewardTopic,
} from '../types';

const HEX_COLOR = /^#[0-9a-f]{6}$/i;

export const COIN_NAME_MAX = 20;
export const COIN_VALUE_MAX = 1000;
export const REWARD_COINS_MAX = 1000;

export function isHexColor(text: string): boolean {
  return HEX_COLOR.test(text.trim());
}

function channel(value: number): number {
  const scaled = value / 255;
  return scaled <= 0.03928 ? scaled / 12.92 : ((scaled + 0.055) / 1.055) ** 2.4;
}

function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((start) => parseInt(hex.slice(start, start + 2), 16));
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

export function contrastRatio(a: string, b: string): number {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (light + 0.05) / (dark + 0.05);
}

const BRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

export function formatReais(value: number): string {
  return BRL.format(value);
}

export function parseReais(text: string): number {
  const cleaned = text.replace(/[^\d,.]/g, '').replace(/\./g, '').replace(',', '.');
  return cleaned ? Number(cleaned) : NaN;
}

export function formatReaisInput(value: number): string {
  return Number.isFinite(value) ? value.toFixed(2).replace('.', ',') : '';
}

export function ruleOf(table: RewardTable, topic: RewardTopic): RewardRule {
  return table[topic] ?? { coins: 0 };
}

export function fullReviewCoins(table: RewardTable, kind: ProductKind): number {
  return REWARD_TOPICS_BY_KIND[kind].reduce((sum, topic) => sum + ruleOf(table, topic).coins, 0);
}

export type CoinForm = Omit<CoinSettings, 'valueInReais' | 'enabled' | 'companyId'> & { valueText: string };

export type CoinFormErrors = Partial<Record<'name' | 'color' | 'valueText', string>> & {
  rewards?: Partial<Record<`${'product' | 'service'}.${RewardTopic}`, string>>;
};

export function validateCoinForm(form: CoinForm, iconColor: string, minContrast: number): CoinFormErrors {
  const errors: CoinFormErrors = {};
  const name = form.name.trim();
  if (!name) errors.name = 'Dê um nome para a moeda.';
  else if (name.length > COIN_NAME_MAX) errors.name = `Use até ${COIN_NAME_MAX} caracteres.`;
  if (!isHexColor(form.color)) errors.color = 'Use uma cor no formato #RRGGBB.';
  else if (contrastRatio(form.color, iconColor) < minContrast) errors.color = 'Cor clara demais: o ícone branco some. Escolha um tom mais escuro.';
  const value = parseReais(form.valueText);
  if (!form.valueText.trim()) errors.valueText = 'Informe quanto vale uma moeda.';
  else if (!Number.isFinite(value) || value <= 0) errors.valueText = 'O valor precisa ser maior que zero.';
  else if (value > COIN_VALUE_MAX) errors.valueText = `Use até ${formatReais(COIN_VALUE_MAX)}.`;

  const rewardErrors: NonNullable<CoinFormErrors['rewards']> = {};
  (['product', 'service'] as const).forEach((kind) => {
    REWARD_TOPICS_BY_KIND[kind].forEach((topic) => {
      const rule = ruleOf(form.rewards[kind], topic);
      const threshold = REWARD_THRESHOLD[topic];
      if (!Number.isInteger(rule.coins) || rule.coins < 0) rewardErrors[`${kind}.${topic}`] = 'Use um número inteiro, 0 ou mais.';
      else if (rule.coins > REWARD_COINS_MAX) rewardErrors[`${kind}.${topic}`] = `Use até ${REWARD_COINS_MAX}.`;
      else if (threshold && rule.coins > 0 && (!Number.isInteger(rule.threshold) || (rule.threshold ?? 0) < threshold.min))
        rewardErrors[`${kind}.${topic}`] = `Informe a partir de quantas ${threshold.unit}.`;
    });
  });
  if (Object.keys(rewardErrors).length > 0) errors.rewards = rewardErrors;
  return errors;
}
