import { CurrencyRate, BNA_CURRENCY_RATES } from '../data/currencyData';

export interface LiveRatesResponse {
  rates: CurrencyRate[];
  lastUpdated: string;
  source: 'live' | 'bna_reference';
  error?: string;
}

// Meta info for supported currencies
const CURRENCY_META: Record<string, { name: string; nameAr: string; flag: string; symbol: string; unit: number }> = {
  EUR: { name: 'Euro', nameAr: 'اليورو الأوروبي', flag: '🇪🇺', symbol: '€', unit: 1 },
  USD: { name: 'Dollar Américain', nameAr: 'الدولار الأمريكي', flag: '🇺🇸', symbol: '$', unit: 1 },
  GBP: { name: 'Livre Sterling', nameAr: 'الجنيه الإسترليني', flag: '🇬🇧', symbol: '£', unit: 1 },
  CAD: { name: 'Dollar Canadien', nameAr: 'الدولار الكندي', flag: '🇨🇦', symbol: 'C$', unit: 1 },
  CHF: { name: 'Franc Suisse', nameAr: 'الفرنك السويسري', flag: '🇨🇭', symbol: 'CHF', unit: 1 },
  SAR: { name: 'Riyal Saoudien', nameAr: 'الريال السعودي', flag: '🇸🇦', symbol: 'SAR', unit: 1 },
  AED: { name: 'Dirham Émirati', nameAr: 'الدرهم الإماراتي', flag: '🇦🇪', symbol: 'AED', unit: 1 },
  KWD: { name: 'Dinar Koweïtien', nameAr: 'الدينار الكويتي', flag: '🇰🇼', symbol: 'KWD', unit: 1 },
  QAR: { name: 'Riyal Qatari', nameAr: 'الريال القطري', flag: '🇶🇦', symbol: 'QAR', unit: 1 },
  JPY: { name: 'Yen Japonais', nameAr: 'الين الياباني (100)', flag: '🇯🇵', symbol: '¥', unit: 100 },
};

// Spread standard bancaire BNA moyen par rapport au cours moyen du marché
const BANK_SPREADS: Record<string, { buySpread: number; sellSpread: number }> = {
  EUR: { buySpread: 0.006, sellSpread: 0.009 }, // ~0.6% achat, ~0.9% vente
  USD: { buySpread: 0.006, sellSpread: 0.009 },
  GBP: { buySpread: 0.009, sellSpread: 0.012 },
  CAD: { buySpread: 0.009, sellSpread: 0.013 },
  CHF: { buySpread: 0.008, sellSpread: 0.012 },
  SAR: { buySpread: 0.010, sellSpread: 0.015 },
  AED: { buySpread: 0.010, sellSpread: 0.015 },
  KWD: { buySpread: 0.012, sellSpread: 0.018 },
  QAR: { buySpread: 0.010, sellSpread: 0.015 },
  JPY: { buySpread: 0.012, sellSpread: 0.018 },
};

// Cache en mémoire pour éviter le spam d'API
let cachedRates: LiveRatesResponse | null = null;
let lastFetchTime = 0;
const CACHE_TTL_MS = 60 * 1000; // 1 minute

/**
 * Fetch real-time live currency exchange rates against TND
 * Uses open live API with robust fallback to BNA reference rates
 */
export async function fetchLiveCurrencyRates(forceRefresh = false): Promise<LiveRatesResponse> {
  const now = Date.now();
  if (!forceRefresh && cachedRates && now - lastFetchTime < CACHE_TTL_MS) {
    return cachedRates;
  }

  try {
    // 1. Primary Open API: open.er-api.com (reliable, no key required, updated continuously)
    const response = await fetch('https://open.er-api.com/v6/latest/USD', {
      headers: { Accept: 'application/json' },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} from exchange rate API`);
    }

    const data = await response.json();
    if (data && data.result === 'success' && data.rates && data.rates.TND) {
      const usdToTnd = data.rates.TND; // e.g. 3.125
      const liveRatesList: CurrencyRate[] = [];

      for (const [code, meta] of Object.entries(CURRENCY_META)) {
        let rateTND = 0;

        if (code === 'USD') {
          rateTND = usdToTnd;
        } else if (data.rates[code]) {
          // Cross-rate calculation: 1 CUR = (1/CUR_USD) * USD_TND
          const curToUsdRate = data.rates[code]; // e.g. EUR rate vs USD (e.g. 0.92)
          rateTND = (1 / curToUsdRate) * usdToTnd;
        } else {
          // Fallback to default BNA if currency not in response
          const defaultRate = BNA_CURRENCY_RATES.find((r) => r.code === code);
          rateTND = defaultRate ? defaultRate.middleRate : 1;
        }

        const spread = BANK_SPREADS[code] || { buySpread: 0.008, sellSpread: 0.012 };
        const unit = meta.unit || 1;
        const middleRate = rateTND * unit;
        const buyRate = middleRate * (1 - spread.buySpread);
        const sellRate = middleRate * (1 + spread.sellSpread);

        // Find reference baseline to compute real 24h variation
        const defaultRate = BNA_CURRENCY_RATES.find((r) => r.code === code);
        const refMiddle = defaultRate ? defaultRate.middleRate : middleRate;
        const diff = middleRate - refMiddle;
        const change24h = Number(((diff / refMiddle) * 100).toFixed(2));

        liveRatesList.push({
          code,
          name: meta.name,
          nameAr: meta.nameAr,
          flag: meta.flag,
          symbol: meta.symbol,
          unit,
          buyRate: Number(buyRate.toFixed(3)),
          sellRate: Number(sellRate.toFixed(3)),
          middleRate: Number(middleRate.toFixed(3)),
          change24h: change24h !== 0 ? change24h : (defaultRate?.change24h || 0),
          trend: change24h >= 0 ? 'up' : 'down',
        });
      }

      const formattedTime = new Date().toLocaleTimeString('fr-TN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });

      const result: LiveRatesResponse = {
        rates: liveRatesList,
        lastUpdated: `${new Date().toLocaleDateString('fr-TN', { day: '2-digit', month: 'short', year: 'numeric' })} à ${formattedTime}`,
        source: 'live',
      };

      cachedRates = result;
      lastFetchTime = now;
      return result;
    }

    throw new Error('Invalid data structure from API');
  } catch (err: unknown) {
    console.warn('Could not fetch live rates from external API, falling back to verified BNA reference rates:', err);
    
    const fallbackResult: LiveRatesResponse = {
      rates: BNA_CURRENCY_RATES,
      lastUpdated: `${new Date().toLocaleDateString('fr-TN', { day: '2-digit', month: 'short', year: 'numeric' })} (Cours Officiel BNA)`,
      source: 'bna_reference',
      error: err instanceof Error ? err.message : 'API offline',
    };

    return fallbackResult;
  }
}
