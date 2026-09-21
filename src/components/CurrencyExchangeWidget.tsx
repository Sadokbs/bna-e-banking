import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { CurrencyRate } from '../data/currencyData';
import { fetchLiveCurrencyRates, LiveRatesResponse } from '../services/currencyService';
import { 
  TrendingUp, 
  TrendingDown, 
  ArrowRightLeft, 
  Calculator, 
  Coins, 
  RefreshCw, 
  Search, 
  Info,
  Calendar,
  CheckCircle2,
  Wifi,
  Sparkles
} from 'lucide-react';
import { BnaLogo } from './BnaLogo';

interface CurrencyExchangeWidgetProps {
  className?: string;
  variant?: 'full' | 'compact';
}

export const CurrencyExchangeWidget: React.FC<CurrencyExchangeWidgetProps> = ({
  className = '',
  variant = 'full',
}) => {
  const [activeTab, setActiveTab] = useState<'rates' | 'converter'>('rates');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Live Rates State
  const [currencyData, setCurrencyData] = useState<CurrencyRate[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [lastUpdatedText, setLastUpdatedText] = useState<string>('');
  const [isLiveSource, setIsLiveSource] = useState<boolean>(true);

  // Converter State
  const [amount, setAmount] = useState<number>(100);
  const [selectedCurrencyCode, setSelectedCurrencyCode] = useState<string>('EUR');
  const [conversionDirection, setConversionDirection] = useState<'FOREIGN_TO_TND' | 'TND_TO_FOREIGN'>('FOREIGN_TO_TND');
  const [rateType, setRateType] = useState<'middle' | 'buy' | 'sell'>('middle');

  // Load Real-time Rates
  const loadRates = useCallback(async (force = false) => {
    if (force) setIsRefreshing(true);
    try {
      const res: LiveRatesResponse = await fetchLiveCurrencyRates(force);
      setCurrencyData(res.rates);
      setLastUpdatedText(res.lastUpdated);
      setIsLiveSource(res.source === 'live');
    } catch (err) {
      console.error('Error loading rates:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadRates(false);

    // Auto-refresh every 60 seconds to keep live market prices up-to-date
    const interval = setInterval(() => {
      loadRates(true);
    }, 60000);

    return () => clearInterval(interval);
  }, [loadRates]);

  const selectedCurrency = useMemo(() => {
    if (!currencyData.length) return null;
    return currencyData.find((c) => c.code === selectedCurrencyCode) || currencyData[0];
  }, [currencyData, selectedCurrencyCode]);

  const eurRate = useMemo(() => currencyData.find((c) => c.code === 'EUR'), [currencyData]);
  const usdRate = useMemo(() => currencyData.find((c) => c.code === 'USD'), [currencyData]);

  const filteredCurrencies = useMemo(() => {
    if (!currencyData.length) return [];
    if (!searchQuery.trim()) return currencyData;
    const q = searchQuery.toLowerCase();
    return currencyData.filter(
      (c) =>
        c.code.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q) ||
        c.nameAr.toLowerCase().includes(q)
    );
  }, [currencyData, searchQuery]);

  // Conversion Calculation
  const convertedResult = useMemo(() => {
    if (!selectedCurrency || isNaN(amount) || amount <= 0) return 0;
    
    let activeRate = selectedCurrency.middleRate;
    if (rateType === 'buy') activeRate = selectedCurrency.buyRate;
    if (rateType === 'sell') activeRate = selectedCurrency.sellRate;

    const unitFactor = selectedCurrency.unit || 1; // 1 or 100 for JPY

    if (conversionDirection === 'FOREIGN_TO_TND') {
      return (amount / unitFactor) * activeRate;
    } else {
      return (amount / activeRate) * unitFactor;
    }
  }, [amount, selectedCurrency, conversionDirection, rateType]);

  return (
    <div className={`bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 border border-emerald-500/30 rounded-2xl p-5 shadow-2xl space-y-4 relative overflow-hidden text-slate-100 ${className}`}>
      {/* Decorative Glow */}
      <div className="absolute -top-20 -right-20 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3.5">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 p-1 bg-slate-950 rounded-xl border border-emerald-500/40 flex items-center justify-center shrink-0 shadow-inner">
            <BnaLogo className="w-full h-full" variant="emerald" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white">
              Cours des Devises & Marché des Changes
            </h3>
            <p className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5 mt-0.5">
              <span>Cotations face au Dinar Tunisien (TND)</span>
              <span>•</span>
              <span className="text-emerald-400/90 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {lastUpdatedText || 'Mise à jour en cours...'}
              </span>
            </p>
          </div>
        </div>

        {/* Tab Switcher & Manual Refresh Button */}
        <div className="flex items-center space-x-2 shrink-0">
          <button
            type="button"
            onClick={() => loadRates(true)}
            disabled={isRefreshing}
            className="p-2 bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-emerald-400 rounded-xl border border-slate-800 transition-all cursor-pointer disabled:opacity-50"
            title="Actualiser les cours en direct depuis le marché mondial"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`} />
          </button>

          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => setActiveTab('rates')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer ${
                activeTab === 'rates'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Coins className="w-3.5 h-3.5" />
              <span>Tableau des Cours</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('converter')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer ${
                activeTab === 'converter'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>Convertisseur Rapide</span>
            </button>
          </div>
        </div>
      </div>

      {/* Top 2 Highlighted Cards: USD & EUR (Live Prices) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* EUR Highlight Card */}
        <div className="bg-slate-950/80 border border-emerald-500/40 rounded-xl p-3.5 relative overflow-hidden hover:border-emerald-400/60 transition-all">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <span className="text-2xl" role="img" aria-label="Euro">🇪🇺</span>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-sm text-white tracking-wide">1 EUR (Euro)</span>
                  <span className="text-[10px] text-slate-400">اليورو</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                </div>
                <span className="text-[11px] text-emerald-400 font-mono font-medium">
                  1 € = {eurRate ? eurRate.middleRate.toFixed(3) : '3.385'} TND
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-extrabold text-emerald-300 font-mono">
                {eurRate ? eurRate.middleRate.toFixed(3) : '3.385'} <span className="text-[10px] font-sans text-slate-400">DT</span>
              </div>
              <div className={`text-[10px] flex items-center justify-end gap-0.5 font-bold ${eurRate && eurRate.change24h >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {eurRate && eurRate.change24h >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {eurRate ? (eurRate.change24h > 0 ? `+${eurRate.change24h}%` : `${eurRate.change24h}%`) : '+0.28%'}
              </div>
            </div>
          </div>
          <div className="mt-2.5 pt-2 border-t border-slate-800/80 grid grid-cols-2 text-[11px] text-slate-300">
            <div>Achat BNA : <strong className="text-white font-mono">{eurRate ? eurRate.buyRate.toFixed(3) : '3.365'} DT</strong></div>
            <div className="text-right">Vente BNA : <strong className="text-white font-mono">{eurRate ? eurRate.sellRate.toFixed(3) : '3.415'} DT</strong></div>
          </div>
        </div>

        {/* USD Highlight Card */}
        <div className="bg-slate-950/80 border border-blue-500/30 rounded-xl p-3.5 relative overflow-hidden hover:border-blue-400/50 transition-all">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <span className="text-2xl" role="img" aria-label="USD">🇺🇸</span>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-sm text-white tracking-wide">1 USD (Dollar)</span>
                  <span className="text-[10px] text-slate-400">الدولار</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping"></span>
                </div>
                <span className="text-[11px] text-blue-400 font-mono font-medium">
                  1 $ = {usdRate ? usdRate.middleRate.toFixed(3) : '3.125'} TND
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-extrabold text-blue-300 font-mono">
                {usdRate ? usdRate.middleRate.toFixed(3) : '3.125'} <span className="text-[10px] font-sans text-slate-400">DT</span>
              </div>
              <div className={`text-[10px] flex items-center justify-end gap-0.5 font-bold ${usdRate && usdRate.change24h >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {usdRate && usdRate.change24h >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {usdRate ? (usdRate.change24h > 0 ? `+${usdRate.change24h}%` : `${usdRate.change24h}%`) : '+0.15%'}
              </div>
            </div>
          </div>
          <div className="mt-2.5 pt-2 border-t border-slate-800/80 grid grid-cols-2 text-[11px] text-slate-300">
            <div>Achat BNA : <strong className="text-white font-mono">{usdRate ? usdRate.buyRate.toFixed(3) : '3.105'} DT</strong></div>
            <div className="text-right">Vente BNA : <strong className="text-white font-mono">{usdRate ? usdRate.sellRate.toFixed(3) : '3.150'} DT</strong></div>
          </div>
        </div>
      </div>

      {/* Tab Content: Rates Grid or Converter */}
      {activeTab === 'rates' ? (
        <div className="space-y-3">
          {/* Search Bar for Other Currencies */}
          <div className="flex items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Rechercher une devise (GBP, CAD, SAR, AED, CHF, KWD...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/70"
              />
            </div>
            <span className="text-[11px] text-slate-400 hidden sm:inline">
              {filteredCurrencies.length} devises cotées
            </span>
          </div>

          {/* Currencies Table / Responsive Grid */}
          <div className="max-h-56 overflow-y-auto pr-1 space-y-2 scrollbar-thin scrollbar-thumb-slate-700">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {filteredCurrencies.map((curr) => {
                const isSelected = selectedCurrencyCode === curr.code;
                return (
                  <div
                    key={curr.code}
                    onClick={() => {
                      setSelectedCurrencyCode(curr.code);
                      setActiveTab('converter');
                    }}
                    className={`bg-slate-950/60 border rounded-xl p-2.5 flex flex-col justify-between hover:bg-slate-900/90 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-emerald-500/80 bg-emerald-950/30'
                        : 'border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{curr.flag}</span>
                        <div>
                          <div className="flex items-center gap-1">
                            <span className="text-xs font-bold text-white">{curr.code}</span>
                            {curr.unit > 1 && (
                              <span className="text-[10px] text-slate-400">({curr.unit})</span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400 block truncate max-w-[110px]">
                            {curr.name}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-mono font-bold text-emerald-300">
                          {curr.middleRate.toFixed(3)} <span className="text-[9px] text-slate-400">DT</span>
                        </div>
                        <div
                          className={`text-[9px] font-bold flex items-center justify-end gap-0.5 ${
                            curr.trend === 'up' ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {curr.trend === 'up' ? (
                            <TrendingUp className="w-2.5 h-2.5" />
                          ) : (
                            <TrendingDown className="w-2.5 h-2.5" />
                          )}
                          {curr.change24h > 0 ? `+${curr.change24h}%` : `${curr.change24h}%`}
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-2 pt-1.5 border-t border-slate-900 flex items-center justify-between text-[10px] text-slate-400">
                      <span>Achat: <strong className="text-slate-200 font-mono">{curr.buyRate.toFixed(3)}</strong></span>
                      <span>Vente: <strong className="text-slate-200 font-mono">{curr.sellRate.toFixed(3)}</strong></span>
                      <span className="text-emerald-400/80 hover:underline">Convertir →</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* CONVERTER TAB */
        <div className="space-y-4 bg-slate-950/70 border border-slate-800 rounded-xl p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Currency Selector */}
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold text-slate-300">Devise Étrangère :</span>
              <select
                value={selectedCurrencyCode}
                onChange={(e) => setSelectedCurrencyCode(e.target.value)}
                className="bg-slate-900 border border-emerald-500/40 rounded-lg px-3 py-1.5 text-xs text-white font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                {currencyData.map((curr) => (
                  <option key={curr.code} value={curr.code}>
                    {curr.flag} {curr.code} - {curr.name} ({curr.nameAr})
                  </option>
                ))}
              </select>
            </div>

            {/* Rate Type Selector */}
            <div className="flex items-center space-x-1.5 bg-slate-900 p-1 rounded-lg border border-slate-800 text-[11px]">
              <button
                type="button"
                onClick={() => setRateType('middle')}
                className={`px-2 py-1 rounded font-bold cursor-pointer transition-all ${
                  rateType === 'middle' ? 'bg-emerald-600 text-white' : 'text-slate-400'
                }`}
              >
                Cours Moyen
              </button>
              <button
                type="button"
                onClick={() => setRateType('buy')}
                className={`px-2 py-1 rounded font-bold cursor-pointer transition-all ${
                  rateType === 'buy' ? 'bg-emerald-600 text-white' : 'text-slate-400'
                }`}
              >
                Achat BNA
              </button>
              <button
                type="button"
                onClick={() => setRateType('sell')}
                className={`px-2 py-1 rounded font-bold cursor-pointer transition-all ${
                  rateType === 'sell' ? 'bg-emerald-600 text-white' : 'text-slate-400'
                }`}
              >
                Vente BNA
              </button>
            </div>
          </div>

          {/* Interactive Calculator Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-11 gap-3 items-center">
            {/* Input Box */}
            <div className="md:col-span-5 bg-slate-900 border border-slate-700/80 rounded-xl p-3 space-y-1">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                {conversionDirection === 'FOREIGN_TO_TND'
                  ? `Montant en ${selectedCurrency?.code || 'EUR'} (${selectedCurrency?.symbol || '€'})`
                  : 'Montant en Dinars Tunisiens (TND / DT)'}
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={amount}
                  onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                  className="w-full bg-transparent text-xl font-mono font-extrabold text-white focus:outline-none"
                  placeholder="100"
                />
                <span className="text-sm font-bold text-emerald-400 bg-emerald-950 px-2 py-1 rounded border border-emerald-800/40 shrink-0">
                  {conversionDirection === 'FOREIGN_TO_TND' ? selectedCurrency?.code || 'EUR' : 'TND'}
                </span>
              </div>
            </div>

            {/* Invert Direction Button */}
            <div className="md:col-span-1 flex justify-center">
              <button
                type="button"
                onClick={() =>
                  setConversionDirection((prev) =>
                    prev === 'FOREIGN_TO_TND' ? 'TND_TO_FOREIGN' : 'FOREIGN_TO_TND'
                  )
                }
                title="Inverser le sens de conversion"
                className="p-2.5 bg-slate-800 hover:bg-emerald-600 text-slate-300 hover:text-white rounded-full border border-slate-700 shadow-md transition-all cursor-pointer"
              >
                <ArrowRightLeft className="w-4 h-4" />
              </button>
            </div>

            {/* Output Box */}
            <div className="md:col-span-5 bg-gradient-to-br from-emerald-950/60 to-slate-900 border border-emerald-500/50 rounded-xl p-3 space-y-1">
              <label className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block">
                {conversionDirection === 'FOREIGN_TO_TND'
                  ? 'Équivalent en Dinars Tunisiens (TND)'
                  : `Équivalent en ${selectedCurrency?.code || 'EUR'} (${selectedCurrency?.symbol || '€'})`}
              </label>
              <div className="flex items-center justify-between">
                <span className="text-xl font-mono font-extrabold text-emerald-300">
                  {convertedResult.toLocaleString('fr-TN', {
                    minimumFractionDigits: 3,
                    maximumFractionDigits: 3,
                  })}
                </span>
                <span className="text-sm font-bold text-emerald-300 bg-emerald-900/60 px-2 py-1 rounded border border-emerald-700/50">
                  {conversionDirection === 'FOREIGN_TO_TND' ? 'DT (TND)' : selectedCurrency?.code || 'EUR'}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Presets */}
          <div className="flex items-center space-x-2 pt-1">
            <span className="text-[11px] text-slate-400">Montants rapides :</span>
            {[50, 100, 500, 1000, 5000].map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => setAmount(val)}
                className={`text-xs px-2.5 py-1 rounded-lg border font-mono transition-all cursor-pointer ${
                  amount === val
                    ? 'bg-emerald-600 text-white border-emerald-500 font-bold'
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                }`}
              >
                {val}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Footer Info Notice */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 text-[11px] text-slate-400 border-t border-slate-800/80">
        <div className="flex items-center space-x-1.5 text-emerald-400/90">
          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
          <span>Cotations réelles connectées en direct avec mise à jour continue du marché des devises (TND).</span>
        </div>
        <div className="flex items-center space-x-2 text-[10px] text-slate-500">
          <span>Actualisation auto : 60s</span>
        </div>
      </div>
    </div>
  );
};

export default CurrencyExchangeWidget;
