import type { Trip } from './types';

export interface CurrencyInfo {
  code: string;
  symbol: string;
  name: string;
}

export const CURRENCIES: CurrencyInfo[] = [
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'USD', symbol: '$', name: 'Dólar estadounidense' },
  { code: 'GBP', symbol: '£', name: 'Libra esterlina' },
  { code: 'CHF', symbol: 'Fr', name: 'Franco suizo' },
  { code: 'JPY', symbol: '¥', name: 'Yen japonés' },
  { code: 'ARS', symbol: '$', name: 'Peso argentino' },
  { code: 'MXN', symbol: '$', name: 'Peso mexicano' },
  { code: 'COP', symbol: '$', name: 'Peso colombiano' },
  { code: 'CLP', symbol: '$', name: 'Peso chileno' },
  { code: 'UYU', symbol: '$', name: 'Peso uruguayo' },
  { code: 'PEN', symbol: 'S/', name: 'Sol peruano' },
  { code: 'BRL', symbol: 'R$', name: 'Real brasileño' },
  { code: 'CAD', symbol: '$', name: 'Dólar canadiense' },
  { code: 'AUD', symbol: '$', name: 'Dólar australiano' },
  { code: 'MAD', symbol: 'DH', name: 'Dirham marroquí' },
  { code: 'TRY', symbol: '₺', name: 'Lira turca' },
  { code: 'CZK', symbol: 'Kč', name: 'Corona checa' },
  { code: 'PLN', symbol: 'zł', name: 'Zloty polaco' },
  { code: 'HUF', symbol: 'Ft', name: 'Forinto húngaro' },
  { code: 'THB', symbol: '฿', name: 'Baht tailandés' },
];

export const currencyLabel = (code: string): string => {
  const c = CURRENCIES.find(x => x.code === code);
  return c ? `${c.symbol} ${c.code} - ${c.name}` : code;
};

/** Monedas activas del viaje: siempre incluye la principal, primero. */
export const getTripCurrencies = (trip: Pick<Trip, 'currency' | 'currencies'>): string[] => {
  const list = trip.currencies && trip.currencies.length ? trip.currencies : [trip.currency];
  return [trip.currency, ...list.filter(c => c !== trip.currency)];
};

/**
 * exchangeRates[code] = unidades de `code` por 1 unidad de la moneda principal.
 * Devuelve el importe convertido a la moneda principal del viaje.
 * Si falta la tasa, devuelve el importe tal cual (y `missing` lo señala).
 */
export const toBaseCurrency = (
  amount: number,
  from: string | undefined,
  trip: Pick<Trip, 'currency' | 'exchangeRates'>
): number => {
  if (!from || from === trip.currency) return amount;
  const rate = trip.exchangeRates?.[from];
  if (!rate || rate <= 0) return amount;
  return amount / rate;
};

export const hasRate = (
  from: string | undefined,
  trip: Pick<Trip, 'currency' | 'exchangeRates'>
): boolean => !from || from === trip.currency || !!(trip.exchangeRates?.[from] && trip.exchangeRates[from] > 0);

export const formatMoney = (amount: number, code: string): string => {
  const decimals = code === 'JPY' || code === 'CLP' || code === 'COP' || code === 'HUF' ? 0 : 2;
  return `${amount.toFixed(decimals)} ${code}`;
};

export const fetchRates = async (base: string, codes: string[]): Promise<Record<string, number>> => {
  const res = await fetch(`https://open.er-api.com/v6/latest/${encodeURIComponent(base)}`);
  if (!res.ok) throw new Error('rates http ' + res.status);
  const data = await res.json();
  if (!data || !data.rates) throw new Error('rates payload');
  const out: Record<string, number> = {};
  codes.forEach(c => {
    if (c !== base && typeof data.rates[c] === 'number') out[c] = data.rates[c];
  });
  return out;
};
