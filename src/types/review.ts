export type Characteristic = 'entrega' | 'qualidade' | 'conformidade' | 'custoBeneficio';

export const CHARACTERISTICS: Characteristic[] = ['entrega', 'qualidade', 'conformidade', 'custoBeneficio'];

export const CHARACTERISTIC_LABEL: Record<Characteristic, string> = {
  entrega: 'Entrega',
  qualidade: 'Qualidade',
  conformidade: 'Conformidade',
  custoBeneficio: 'Custo-benefício',
};

export type Sentiment = 'positive' | 'negative';

export type Tag = {
  id: string;
  label: string;
  sentiment: Sentiment;
  characteristic: Characteristic;
};

export type Review = {
  id: string;
  productId: string;
  companyId: string;
  authorId: string;
  createdAt: string;
  title: string;
  ratings: Record<Characteristic, number>;
  positiveTagIds: string[];
  negativeTagIds: string[];
  comment: string;
  wouldBuyAgain: boolean | null;
  agreements: number;
  disagreements: number;
};
