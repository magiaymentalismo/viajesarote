import React, { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { CURRENCIES, fetchRates } from '../currencies';

export interface CurrencyValue {
  currency: string;
  currencies: string[];
  exchangeRates: Record<string, number>;
}

interface Props {
  value: CurrencyValue;
  onChange: (v: CurrencyValue) => void;
}

export const CurrencyPicker: React.FC<Props> = ({ value, onChange }) => {
  const { currency, currencies, exchangeRates } = value;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const others = currencies.filter(c => c !== currency);

  const refresh = async (base: string, codes: string[]) => {
    const targets = codes.filter(c => c !== base);
    if (!targets.length) return {};
    setLoading(true);
    setError('');
    try {
      return await fetchRates(base, targets);
    } catch {
      setError('No se pudo obtener el cambio automático. Puedes escribirlo a mano.');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const setBase = async (base: string) => {
    const next = Array.from(new Set([base, ...currencies]));
    // Las tasas dependen de la moneda principal: se recalculan.
    const rates = await refresh(base, next);
    onChange({ currency: base, currencies: next, exchangeRates: rates ?? {} });
  };

  const toggle = async (code: string) => {
    if (code === currency) return;
    if (currencies.includes(code)) {
      const next = currencies.filter(c => c !== code);
      const { [code]: _removed, ...rest } = exchangeRates;
      onChange({ currency, currencies: next, exchangeRates: rest });
    } else {
      const next = [...currencies, code];
      const rates = await refresh(currency, [code]);
      onChange({
        currency,
        currencies: next,
        exchangeRates: { ...exchangeRates, ...(rates ?? {}) },
      });
    }
  };

  const updateAll = async () => {
    const rates = await refresh(currency, others);
    if (rates) onChange({ ...value, exchangeRates: { ...exchangeRates, ...rates } });
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-bold text-[#434338] uppercase mb-1">
          🪙 Moneda principal (para totales y saldos)
        </label>
        <select
          value={currency}
          onChange={e => setBase(e.target.value)}
          className="w-full text-xs p-3 rounded-2xl border border-[#D9D1B9] bg-white font-bold text-[#434338] focus:outline-[#5A5A40]"
        >
          {CURRENCIES.map(c => (
            <option key={c.code} value={c.code}>
              {c.symbol} {c.code} - {c.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-bold text-[#434338] uppercase mb-1">
          Monedas que vais a usar
        </label>
        <div className="flex flex-wrap gap-1.5">
          {CURRENCIES.map(c => {
            const active = currencies.includes(c.code);
            const isBase = c.code === currency;
            return (
              <button
                key={c.code}
                type="button"
                onClick={() => toggle(c.code)}
                disabled={isBase}
                title={c.name}
                className={`px-2.5 py-1 rounded-full text-[11px] font-bold border transition ${
                  active
                    ? 'bg-[#5A5A40] text-white border-[#5A5A40]'
                    : 'bg-white text-[#434338] border-[#D9D1B9] hover:bg-[#F5F2ED]'
                } ${isBase ? 'opacity-90 cursor-default' : ''}`}
              >
                {c.symbol} {c.code}
              </button>
            );
          })}
        </div>
      </div>

      {others.length > 0 && (
        <div className="rounded-2xl border border-[#D9D1B9] bg-[#FAF6E9] p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase text-[#434338]">Tipo de cambio</span>
            <button
              type="button"
              onClick={updateAll}
              disabled={loading}
              className="flex items-center gap-1 text-[11px] font-bold text-[#5A5A40] hover:underline disabled:opacity-50"
            >
              <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
              Actualizar
            </button>
          </div>
          {others.map(code => (
            <div key={code} className="flex items-center gap-2 text-xs text-[#434338]">
              <span className="font-bold whitespace-nowrap">1 {currency} =</span>
              <input
                type="number"
                step="any"
                min="0"
                value={exchangeRates[code] ?? ''}
                placeholder="?"
                onChange={e => {
                  const n = parseFloat(e.target.value);
                  const next = { ...exchangeRates };
                  if (isNaN(n) || n <= 0) delete next[code];
                  else next[code] = n;
                  onChange({ ...value, exchangeRates: next });
                }}
                className="w-full p-2 rounded-xl border border-[#D9D1B9] bg-white font-bold"
              />
              <span className="font-bold">{code}</span>
            </div>
          ))}
          {error && <p className="text-[11px] text-[#B5651D]">{error}</p>}
        </div>
      )}
    </div>
  );
};
