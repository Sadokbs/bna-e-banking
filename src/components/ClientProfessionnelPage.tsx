import React, { useState } from 'react';
import { UserAccount, BankAccount, CommercialEffect, AgriculturalCredit } from '../types';
import { CurrencyExchangeWidget } from './CurrencyExchangeWidget';
import { 
  MOCK_ACCOUNTS_PRO, 
  MOCK_EFFECTS_PRO, 
  MOCK_CREDITS_AGRICOLES 
} from '../data/mockData';
import { 
  Building2, 
  Briefcase, 
  FileSpreadsheet, 
  Banknote, 
  Send, 
  Calculator, 
  TrendingUp, 
  Download, 
  CheckCircle, 
  Clock, 
  Plus, 
  Shield, 
  Landmark,
  Coins
} from 'lucide-react';

interface ClientProfessionnelPageProps {
  currentUser: UserAccount;
}

export const ClientProfessionnelPage: React.FC<ClientProfessionnelPageProps> = ({ currentUser }) => {
  const [activeTab, setActiveTab] = useState<'tresorerie' | 'credits' | 'effets' | 'mandats' | 'devises'>('tresorerie');
  const [proAccounts, setProAccounts] = useState<BankAccount[]>(MOCK_ACCOUNTS_PRO);
  const [effects, setEffects] = useState<CommercialEffect[]>(MOCK_EFFECTS_PRO);
  const [credits, setCredits] = useState<AgriculturalCredit[]>(MOCK_CREDITS_AGRICOLES);

  // Mandat Cash state
  const [mandatAmount, setMandatAmount] = useState<string>('');
  const [mandatRecipient, setMandatRecipient] = useState<string>('');
  const [mandatCode, setMandatCode] = useState<string | null>(null);

  // Credit Simulator State
  const [simAmount, setSimAmount] = useState<number>(100000);
  const [simMonths, setSimMonths] = useState<number>(36);

  const handleCreateMandat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mandatAmount || !mandatRecipient) return;

    const generatedCode = `BNA-MANDAT-${Math.floor(100000 + Math.random() * 900000)}`;
    setMandatCode(generatedCode);
  };

  const calculatedMonthly = Math.round((simAmount * 1.075) / simMonths);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Top Banner for Client Professionnel Identifiant */}
      <div className="bg-gradient-to-r from-amber-900 via-slate-900 to-slate-900 border border-amber-700/60 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-amber-600 rounded-2xl shadow-lg border border-amber-400/30">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-extrabold text-white">
                Espace Entreprise & Agricole BNA
              </h1>
              <span className="bg-amber-500 text-slate-950 font-mono font-bold text-xs px-2.5 py-1 rounded-full shadow">
                {currentUser.identifiant}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Compte Pro #008402 • {currentUser.name} ({currentUser.organization})
            </p>
          </div>
        </div>

        <div className="bg-slate-800/90 border border-slate-700 px-4 py-2.5 rounded-2xl text-right">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Trésorerie Pro Globale</span>
          <span className="text-xl font-extrabold text-amber-400 font-mono">
            184 920,450 TND + 45 000 EUR
          </span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('tresorerie')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'tresorerie'
              ? 'bg-amber-600 text-white shadow-md'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>Trésorerie & Comptes Pro</span>
        </button>

        <button
          onClick={() => setActiveTab('credits')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'credits'
              ? 'bg-amber-600 text-white shadow-md'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <Landmark className="w-4 h-4" />
          <span>Crédits Agricoles ({credits.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('effets')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'effets'
              ? 'bg-amber-600 text-white shadow-md'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Effets & Lettres de Change ({effects.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('mandats')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'mandats'
              ? 'bg-amber-600 text-white shadow-md'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <Banknote className="w-4 h-4" />
          <span>Mandats Cash & Paie</span>
        </button>

        <button
          onClick={() => setActiveTab('devises')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'devises'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-slate-800 text-emerald-400 hover:bg-slate-700 border border-emerald-500/30'
          }`}
        >
          <Coins className="w-4 h-4 text-emerald-400" />
          <span>Marché des Devises & Changes (TND)</span>
        </button>
      </div>

      {/* TAB 1: Trésorerie Pro */}
      {activeTab === 'tresorerie' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {proAccounts.map((acc) => (
              <div key={acc.id} className="bg-slate-800 border border-slate-700 rounded-2xl p-6 space-y-4">
                <div className="flex justify-between items-start border-b border-slate-700 pb-3">
                  <div>
                    <span className="text-[10px] bg-amber-950 text-amber-300 font-bold px-2 py-0.5 rounded">
                      {acc.type}
                    </span>
                    <p className="text-xs font-mono text-slate-300 mt-2 font-bold">{acc.accountNumber}</p>
                  </div>
                  <span className="text-xs bg-emerald-900 text-emerald-300 font-bold px-2 py-1 rounded-full">
                    Compte Professionnel Validé
                  </span>
                </div>

                <div>
                  <span className="text-[11px] text-slate-400">Solde Créditeur en Banque</span>
                  <div className="text-2xl font-extrabold text-amber-400 font-mono mt-0.5">
                    {acc.balance.toLocaleString('fr-FR', { minimumFractionDigits: 3 })} {acc.currency}
                  </div>
                </div>

                <div className="bg-slate-900/80 p-3 rounded-xl text-xs font-mono space-y-1 text-slate-400">
                  <div>RIB Pro : {acc.rib}</div>
                  <div className="text-[11px] text-slate-500">IBAN : {acc.iban}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: Crédits Agricoles */}
      {activeTab === 'credits' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Active Credits List */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-base font-bold text-white">Engagements & Crédits Campagne Agricole</h3>
            
            {credits.map((crd) => (
              <div key={crd.id} className="bg-slate-800 border border-slate-700 rounded-2xl p-5 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono bg-amber-950 text-amber-300 px-2 py-0.5 rounded">
                      {crd.reference}
                    </span>
                    <h4 className="font-bold text-sm text-white mt-1">{crd.type}</h4>
                  </div>
                  <span className="text-xs font-bold bg-emerald-900 text-emerald-300 px-2.5 py-1 rounded-full">
                    {crd.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-900/80 p-3 rounded-xl text-xs">
                  <div>
                    <span className="text-slate-400 text-[10px] block">Montant Accordé</span>
                    <span className="font-mono text-white font-bold">{crd.totalAmount.toLocaleString()} TND</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Restant Dû</span>
                    <span className="font-mono text-amber-400 font-bold">{crd.remainingAmount.toLocaleString()} TND</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Prochaine Échéance</span>
                    <span className="font-mono text-slate-200">{crd.nextDueDate}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Taux Bonifié</span>
                    <span className="font-mono text-emerald-400 font-bold">{crd.rate}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Credit Simulator */}
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-700 pb-3">
              <Calculator className="w-4 h-4 text-amber-400" />
              Simulateur Crédit Campagne BNA
            </h3>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  Montant souhaité: <span className="text-amber-400 font-mono">{simAmount.toLocaleString()} TND</span>
                </label>
                <input
                  type="range"
                  min="20000"
                  max="500000"
                  step="10000"
                  value={simAmount}
                  onChange={(e) => setSimAmount(Number(e.target.value))}
                  className="w-full accent-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  Durée de remboursement: <span className="text-amber-400 font-mono">{simMonths} Mois</span>
                </label>
                <input
                  type="range"
                  min="12"
                  max="84"
                  step="12"
                  value={simMonths}
                  onChange={(e) => setSimMonths(Number(e.target.value))}
                  className="w-full accent-amber-500"
                />
              </div>

              <div className="bg-slate-900 p-4 rounded-xl border border-slate-700 text-center">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Mensualité Estimée</span>
                <span className="text-xl font-extrabold text-amber-400 font-mono">{calculatedMonthly.toLocaleString()} TND / mois</span>
                <span className="text-[10px] text-emerald-400 block mt-1">Taux bonifié BNA 7.5% inclus</span>
              </div>

              <button
                onClick={() => alert("Votre demande de crédit agricole a été transmise à votre conseiller BNA Bizerte.")}
                className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-2.5 rounded-xl cursor-pointer"
              >
                Soumettre Demande en Ligne
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Effets & Lettres de Change */}
      {activeTab === 'effets' && (
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 space-y-4">
          <h3 className="text-base font-bold text-white">Gestion des Effets & Portefeuille LDC</h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-slate-400 uppercase font-semibold">
                <tr>
                  <th className="p-3 rounded-l-xl">Référence & Type</th>
                  <th className="p-3">Émetteur / Tiers</th>
                  <th className="p-3">Montant</th>
                  <th className="p-3">Échéance</th>
                  <th className="p-3 rounded-r-xl">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700 text-slate-200 font-mono">
                {effects.map((eff) => (
                  <tr key={eff.id}>
                    <td className="p-3 font-bold text-white">{eff.reference} ({eff.type})</td>
                    <td className="p-3 font-sans text-slate-300">{eff.issuer}</td>
                    <td className="p-3 text-amber-400 font-bold">{eff.amount.toLocaleString()} TND</td>
                    <td className="p-3 text-slate-400">{eff.dueDate}</td>
                    <td className="p-3">
                      <span className="bg-slate-700 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded">
                        {eff.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: Mandats Cash */}
      {activeTab === 'mandats' && (
        <div className="max-w-xl mx-auto bg-slate-800 border border-slate-700 rounded-2xl p-6 space-y-6">
          <h3 className="text-base font-bold text-white border-b border-slate-700 pb-3">
            Envoi de Fonds National par Mandat Cash
          </h3>

          {mandatCode && (
            <div className="bg-amber-950 border border-amber-500 p-4 rounded-xl text-center space-y-2">
              <span className="text-xs text-amber-300 block font-bold">Mandat Cash Généré avec Succès !</span>
              <div className="text-xl font-mono font-extrabold text-white tracking-widest bg-slate-900 p-2 rounded">
                {mandatCode}
              </div>
              <p className="text-[11px] text-amber-200">
                Transmettez ce code au bénéficiaire pour retrait dans n'importe quelle agence BNA.
              </p>
            </div>
          )}

          <form onSubmit={handleCreateMandat} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-bold mb-1">Nom Complet du Bénéficiaire & CIN</label>
              <input
                type="text"
                required
                value={mandatRecipient}
                onChange={(e) => setMandatRecipient(e.target.value)}
                placeholder="ex: M. Ali Mansour - CIN 08891200"
                className="w-full bg-slate-900 border border-slate-600 rounded-xl px-3 py-2 text-white"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">Montant à envoyer (TND)</label>
              <input
                type="number"
                required
                value={mandatAmount}
                onChange={(e) => setMandatAmount(e.target.value)}
                placeholder="ex: 500"
                className="w-full bg-slate-900 border border-slate-600 rounded-xl px-3 py-2 text-white font-mono text-base font-bold"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-3 rounded-xl shadow cursor-pointer"
            >
              Émettre le Mandat Cash BNA
            </button>
          </form>
        </div>
      )}

      {/* TAB 5: Marché des Devises & Changes */}
      {activeTab === 'devises' && (
        <div className="space-y-4">
          <CurrencyExchangeWidget />
        </div>
      )}

    </div>
  );
};
