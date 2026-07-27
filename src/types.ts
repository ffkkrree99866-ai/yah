export type Karat = '24' | '22' | '21' | '18';

export interface KaratPrice {
  karat: Karat;
  label: string;
  buy: number;
  sell: number;
  change: number; // percentage change since last update
}

export interface GoldPriceState {
  basePricePerGram24k: number; // SAR per gram for 24k
  updatedAt: Date;
  trend: 'up' | 'down' | 'stable';
}
