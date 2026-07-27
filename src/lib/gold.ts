import type { Karat, KaratPrice } from '../types';

export const KARAT_PURITY: Record<Karat, number> = {
  '24': 1.0,
  '22': 22 / 24,
  '21': 21 / 24,
  '18': 18 / 24,
};

export const KARAT_LABELS: Record<Karat, string> = {
  '24': 'عيار 24',
  '22': 'عيار 22',
  '21': 'عيار 21',
  '18': 'عيار 18',
};

// Spread between buy and sell (the jeweler's margin), as a fraction of spot.
const BUY_MARGIN = 0.0; // buy = spot
const SELL_MARGIN = 0.03; // sell (customer buys from us) is 3% above spot

export function computePrices(basePricePerGram24k: number): KaratPrice[] {
  const karats: Karat[] = ['24', '22', '21', '18'];
  return karats.map((k) => {
    const spot = basePricePerGram24k * KARAT_PURITY[k];
    return {
      karat: k,
      label: KARAT_LABELS[k],
      buy: Math.round(spot * (1 + BUY_MARGIN)),
      sell: Math.round(spot * (1 + SELL_MARGIN)),
      change: 0,
    };
  });
}

export function formatSAR(value: number): string {
  return new Intl.NumberFormat('ar-SA', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatTime(d: Date): string {
  return new Intl.DateTimeFormat('ar-SA', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(d);
}

export function formatDate(d: Date): string {
  return new Intl.DateTimeFormat('ar-SA', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(d);
}
