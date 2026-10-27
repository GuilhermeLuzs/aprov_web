import type { CoinSettings, RewardTable } from '../types';

const productRewards: RewardTable = {
  review: { coins: 10 },
  tags: { coins: 5, threshold: 3 },
  video: { coins: 10 },
  photos: { coins: 5, threshold: 2 },
  photoInUse: { coins: 5 },
  longComment: { coins: 5, threshold: 100 },
  consistentComment: { coins: 5 },
};

const serviceRewards: RewardTable = {
  review: { coins: 15 },
  tags: { coins: 5, threshold: 3 },
  photos: { coins: 5, threshold: 1 },
  longComment: { coins: 10, threshold: 150 },
  consistentComment: { coins: 5 },
};

export const coinSettings: CoinSettings[] = [
  {
    companyId: 'c2',
    enabled: true,
    name: 'PratosVó',
    color: '#B45309',
    icon: 'utensils',
    valueInReais: 0.1,
    rewards: { product: productRewards, service: serviceRewards },
  },
];

export function defaultCoinSettings(companyId: string): CoinSettings {
  return {
    companyId,
    enabled: false,
    name: '',
    color: '#0369A1',
    icon: 'coins',
    valueInReais: 0.1,
    rewards: { product: { ...productRewards }, service: { ...serviceRewards } },
  };
}
