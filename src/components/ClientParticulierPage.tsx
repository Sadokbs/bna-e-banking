import React, { useState } from 'react';
import { UserAccount, BankAccount, BankCard, Transaction } from '../types';
import { BnaLogo } from './BnaLogo';
import { CurrencyExchangeWidget } from './CurrencyExchangeWidget';
import { 
  MOCK_ACCOUNTS_PARTICULIER, 
  MOCK_CARDS_PARTICULIER, 
  MOCK_TRANSACTIONS 
} from '../data/mockData';
import { 
  User, 
  CreditCard, 
  Send, 
  Receipt, 
  FileText, 
  Copy, 
  Check, 
  Download, 
  Lock, 
  Unlock, 
  Plus, 
  Smartphone, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Calendar, 
  Search, 
  HelpCircle,
  AlertCircle,
  Coins,
  Zap,
  CheckCircle2
} from 'lucide-react';

interface ClientParticulierPageProps {
  currentUser: UserAccount;
}

export const ClientParticulierPage: React.FC<ClientParticulierPageProps> = ({ currentUser }) => {
  const [activeTab, setActiveTab] = useState<'comptes' | 'cartes' | 'virements' | 'factures' | 'reclamations'>('comptes');
  const [accounts, setAccounts] = useState<BankAccount[]>(MOCK_ACCOUNTS_PARTICULIER);
  const [cards, setCards] = useState<BankCard[]>(MOCK_CARDS_PARTICULIER);
  const [transactions, setTransactions] = useState<Transaction[]>(MOCK_TRANSACTIONS);

  // Transfer form state
  const [transferRecipient, setTransferRecipient] = useState<string>('');
  const [transferAmount, setTransferAmount] = useState<string>('');
  const [transferReason, setTransferReason] = useState<string>('');
  const [transferSuccess, setTransferSuccess] = useState<boolean>(false);

  // Invoice form state
  const [invoiceProvider, setInvoiceProvider] = useState<'STEG' | 'SONEDE' | 'Telecom'>('STEG');
  const [invoiceRef, setInvoiceRef] = useState<string>('');
  const [invoiceAmount, setInvoiceAmount] = useState<string>('185.400');
  const [invoiceSuccess, setInvoiceSuccess] = useState<boolean>(false);

  // Sub-tab inside Factures & Recharges
  const [serviceSubTab, setServiceSubTab] = useState<'factures' | 'recharge'>('recharge');

  // Phone recharge state
  const [rechargeOperator, setRechargeOperator] = useState<'Telecom' | 'Ooredoo' | 'Orange'>('Telecom');
  const [rechargePhone, setRechargePhone] = useState<string>('');
  const [rechargeAmount, setRechargeAmount] = useState<string>('10');
  const [rechargeSuccess, setRechargeSuccess] = useState<{
    operator: string;
    phone: string;
    amount: number;
    reference: string;
    date: string;
  } | null>(null);
  const [rechargeError, setRechargeError] = useState<string | null>(null);

  // Copied State
  const [copiedRib, setCopiedRib] = useState<string | null>(null);

  const handleCopyRib = (rib: string) => {
    navigator.clipboard.writeText(rib);
    setCopiedRib(rib);
    setTimeout(() => setCopiedRib(null), 2000);
  };

  const handleTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(transferAmount);
    if (!amountNum || amountNum <= 0) return;

    // Deduct from account
    setAccounts(accounts.map((acc, idx) => {
      if (idx === 0) return { ...acc, balance: acc.balance - amountNum };
      return acc;
    }));

    // Add transaction
    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      date: new Date().toLocaleDateString('fr-FR'),
      description: `Virement Émis vers ${transferRecipient}`,
      amount: -amountNum,
      type: 'debit',
      category: 'Virement',
      reference: `VIR-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'completed'
    };

    setTransactions([newTx, ...transactions]);
    setTransferSuccess(true);
    setTransferAmount('');
    setTransferRecipient('');
    setTransferReason('');
    setTimeout(() => setTransferSuccess(false), 4000);
  };

  const handleToggleCardLock = (cardId: string) => {
    setCards(cards.map(c => {
      if (c.id === cardId) {
        return { ...c, status: c.status === 'active' ? 'locked' : 'active' };
      }
      return c;
    }));
  };

  const handlePayInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(invoiceAmount);
    if (!amountNum) return;

    setAccounts(accounts.map((acc, idx) => {
      if (idx === 0) return { ...acc, balance: acc.balance - amountNum };
      return acc;
    }));

    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      date: new Date().toLocaleDateString('fr-FR'),
      description: `Paiement Facture ${invoiceProvider} - Ref ${invoiceRef}`,
      amount: -amountNum,
      type: 'debit',
      category: 'Facture',
      reference: `FAC-${invoiceProvider}-991`,
      status: 'completed'
    };

    setTransactions([newTx, ...transactions]);
    setInvoiceSuccess(true);
    setInvoiceRef('');
    setTimeout(() => setInvoiceSuccess(false), 4000);
  };

  const handleRechargeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRechargeError(null);

    const cleanPhone = rechargePhone.replace(/\s+/g, '');
    if (!/^[2459]\d{7}$/.test(cleanPhone)) {
      setRechargeError('Veuillez saisir un numéro de mobile tunisien valide à 8 chiffres (commençant par 2, 4, 5 ou 9).');
      return;
    }

    const amountNum = parseFloat(rechargeAmount);
    if (!amountNum || amountNum <= 0) {
      setRechargeError('Veuillez spécifier un montant de recharge valide.');
      return;
    }

    const currentAcc = accounts[0];
    if (currentAcc && currentAcc.balance < amountNum) {
      setRechargeError('Solde insuffisant sur votre compte BNA pour effectuer cette recharge.');
      return;
    }

    // Deduct from account
    setAccounts(accounts.map((acc, idx) => {
      if (idx === 0) return { ...acc, balance: Number((acc.balance - amountNum).toFixed(3)) };
      return acc;
    }));

    const operatorName = rechargeOperator === 'Telecom' ? 'Tunisie Telecom' : rechargeOperator;
    const ref = `RCH-${rechargeOperator.toUpperCase().slice(0, 3)}-${Math.floor(1000 + Math.random() * 9000)}`;
    const txDate = new Date().toLocaleDateString('fr-FR');

    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      date: txDate,
      description: `Recharge Téléphonique ${operatorName} (+216 ${cleanPhone})`,
      amount: -amountNum,
      type: 'debit',
      category: 'Recharge Mobile',
      reference: ref,
      status: 'completed'
    };

    setTransactions([newTx, ...transactions]);
    setRechargeSuccess({
      operator: operatorName,
      phone: cleanPhone,
      amount: amountNum,
      reference: ref,
      date: txDate
    });
    setRechargePhone('');
    setTimeout(() => {
      setRechargeSuccess(null);
    }, 6000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Top Banner for Client Particulier */}
      <div className="bg-gradient-to-r from-blue-900 via-slate-900 to-slate-900 border border-blue-700/60 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-blue-600 rounded-2xl shadow-lg border border-blue-400/30">
            <User className="w-8 h-8 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-extrabold text-white">
                Bienvenue, {currentUser.name}
              </h1>
              <span className="bg-blue-500 text-slate-950 font-mono font-bold text-xs px-2.5 py-1 rounded-full shadow">
                {currentUser.identifiant}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Espace Client Particulier • {currentUser.organization}
            </p>
          </div>
        </div>

        {/* Consolidated Total Balance */}
        <div className="bg-slate-800/90 border border-slate-700 px-4 py-2.5 rounded-2xl text-right">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Solde Total Consolidé</span>
          <span className="text-xl font-extrabold text-emerald-400 font-mono">
            {(accounts.reduce((acc, curr) => acc + curr.balance, 0)).toLocaleString('fr-FR', { minimumFractionDigits: 3 })} TND
          </span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('comptes')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'comptes'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Comptes & Relevés</span>
        </button>

        <button
          onClick={() => setActiveTab('cartes')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'cartes'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Mes Cartes ({cards.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('virements')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'virements'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <Send className="w-4 h-4" />
          <span>Virements & Bénéficiaires</span>
        </button>

        <button
          onClick={() => setActiveTab('factures')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'factures'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>Factures & Recharges</span>
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
          <span>Cours des Devises & Convertisseur (TND)</span>
        </button>
      </div>

      {/* TAB 1: Mes Comptes */}
      {activeTab === 'comptes' && (
        <div className="space-y-6">
          {/* Account Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {accounts.map((acc) => (
              <div key={acc.id} className="bg-slate-800 border border-slate-700 rounded-2xl p-6 space-y-4 shadow-lg">
                <div className="flex items-start justify-between border-b border-slate-700/80 pb-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase bg-blue-950 text-blue-300 px-2.5 py-0.5 rounded border border-blue-800">
                      {acc.type}
                    </span>
                    <p className="text-xs font-mono font-bold text-slate-300 mt-2">{acc.accountNumber}</p>
                  </div>
                  <span className="text-xs bg-emerald-900/80 text-emerald-300 font-bold px-2.5 py-1 rounded-full">
                    Actif
                  </span>
                </div>

                <div>
                  <span className="text-[11px] text-slate-400 block font-medium">Solde Disponible</span>
                  <div className="text-2xl font-extrabold text-white font-mono mt-0.5">
                    {acc.balance.toLocaleString('fr-FR', { minimumFractionDigits: 3 })} {acc.currency}
                  </div>
                </div>

                <div className="bg-slate-900/80 rounded-xl p-3 space-y-2 text-xs font-mono">
                  <div className="flex items-center justify-between text-slate-400">
                    <span>RIB : {acc.rib}</span>
                    <button
                      onClick={() => handleCopyRib(acc.rib)}
                      className="text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer"
                    >
                      {copiedRib === acc.rib ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span className="text-[10px]">{copiedRib === acc.rib ? 'Copié' : 'Copier'}</span>
                    </button>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    IBAN : {acc.iban}
                  </div>
                </div>

                <div className="flex space-x-2 pt-1">
                  <button 
                    onClick={() => alert(`Téléchargement du Relevé Officiel RIB BNA (${acc.accountNumber}) en cours...`)}
                    className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Télécharger RIB (PDF)</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Transactions List */}
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              Dernières Opérations Bancaires
            </h3>

            <div className="divide-y divide-slate-700/60">
              {transactions.map((tx) => (
                <div key={tx.id} className="py-3.5 flex items-center justify-between text-xs hover:bg-slate-700/20 px-2 rounded-lg transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-xl ${tx.type === 'credit' ? 'bg-emerald-950 text-emerald-400' : 'bg-slate-700 text-slate-300'}`}>
                      {tx.type === 'credit' ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                    </div>
                    <div>
                      <p className="font-bold text-white text-sm">{tx.description}</p>
                      <div className="flex items-center space-x-2 text-[11px] text-slate-400">
                        <span>{tx.date}</span>
                        <span>•</span>
                        <span className="font-mono text-slate-500">Ref: {tx.reference}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className={`font-mono font-bold text-sm ${tx.type === 'credit' ? 'text-emerald-400' : 'text-slate-200'}`}>
                      {tx.amount > 0 ? `+${tx.amount.toFixed(3)}` : tx.amount.toFixed(3)} TND
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Mes Cartes */}
      {activeTab === 'cartes' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {cards.map((card) => (
            <div key={card.id} className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-3xl p-6 space-y-6 shadow-2xl relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 bg-slate-900 rounded-lg p-1 border border-emerald-500/40 flex items-center justify-center">
                    <BnaLogo className="w-full h-full" variant="emerald" />
                  </div>
                  <span className="font-extrabold text-base text-white tracking-wider">
                    BNA <span className="text-emerald-400">CARTE</span>
                  </span>
                </div>
                <span className="text-xs font-bold bg-slate-700 text-emerald-300 px-3 py-1 rounded-full border border-emerald-500/30">
                  {card.type}
                </span>
              </div>

              <div className="font-mono text-xl text-emerald-400 font-bold tracking-widest my-4">
                {card.cardNumber}
              </div>

              <div className="flex justify-between items-end text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block">Titulaire</span>
                  <span className="font-bold text-white uppercase">{card.cardHolder}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block">Expire fin</span>
                  <span className="font-bold text-white font-mono">{card.expiry}</span>
                </div>
              </div>

              <div className="border-t border-slate-700/80 pt-4 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block">Plaford mensuel utilisé</span>
                  <span className="font-mono text-white font-bold">{card.usedAmount} / {card.monthlyLimit} TND</span>
                </div>

                <button
                  onClick={() => handleToggleCardLock(card.id)}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                    card.status === 'active'
                      ? 'bg-rose-900/80 text-rose-300 hover:bg-rose-800'
                      : 'bg-emerald-900/80 text-emerald-300 hover:bg-emerald-800'
                  }`}
                >
                  {card.status === 'active' ? (
                    <>
                      <Lock className="w-3.5 h-3.5" />
                      <span>Bloquer Carte</span>
                    </>
                  ) : (
                    <>
                      <Unlock className="w-3.5 h-3.5" />
                      <span>Débloquer Carte</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: Virements */}
      {activeTab === 'virements' && (
        <div className="max-w-2xl mx-auto bg-slate-800 border border-slate-700 rounded-2xl p-6 space-y-6">
          <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-700 pb-4">
            <Send className="w-5 h-5 text-blue-400" />
            Exécuter un Virement Bancaire
          </h3>

          {transferSuccess && (
            <div className="bg-emerald-950 border border-emerald-600 rounded-xl p-4 text-emerald-200 text-xs font-bold">
              ✓ Virement envoyé avec succès ! Référence transaction générée.
            </div>
          )}

          <form onSubmit={handleTransferSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-bold mb-1">Compte à débiter</label>
              <select className="w-full bg-slate-900 border border-slate-600 rounded-xl px-3 py-2 text-white font-mono">
                {accounts.map(acc => (
                  <option key={acc.id} value={acc.id}>
                    {acc.type} ({acc.accountNumber}) - Solde: {acc.balance.toFixed(3)} TND
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">Nom du Bénéficiaire & RIB (20 chiffres)</label>
              <input
                type="text"
                required
                value={transferRecipient}
                onChange={(e) => setTransferRecipient(e.target.value)}
                placeholder="ex: M. Ahmed Triki - RIB 03 002 00099887766 55"
                className="w-full bg-slate-900 border border-slate-600 rounded-xl px-3 py-2 text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">Montant en Dinars (TND)</label>
              <input
                type="number"
                step="0.100"
                required
                value={transferAmount}
                onChange={(e) => setTransferAmount(e.target.value)}
                placeholder="ex: 250.000"
                className="w-full bg-slate-900 border border-slate-600 rounded-xl px-3 py-2 text-white font-mono text-base font-bold"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">Motif du virement</label>
              <input
                type="text"
                value={transferReason}
                onChange={(e) => setTransferReason(e.target.value)}
                placeholder="ex: Règlement facture ou loyer"
                className="w-full bg-slate-900 border border-slate-600 rounded-xl px-3 py-2 text-white"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl shadow-lg transition-all cursor-pointer text-sm"
            >
              Valider et Envoyer le Virement
            </button>
          </form>
        </div>
      )}

      {/* TAB 4: Factures & Recharge Téléphonique */}
      {activeTab === 'factures' && (
        <div className="max-w-2xl mx-auto bg-slate-800 border border-slate-700 rounded-2xl p-6 space-y-6 shadow-xl">
          {/* Sub-navigation Switcher: Recharge Téléphonique vs Factures */}
          <div className="grid grid-cols-2 gap-2 bg-slate-900/90 p-1.5 rounded-xl border border-slate-700">
            <button
              type="button"
              onClick={() => {
                setServiceSubTab('recharge');
                setRechargeError(null);
              }}
              className={`py-2.5 px-3 rounded-lg font-bold text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer ${
                serviceSubTab === 'recharge'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span>Recharge Téléphonique (Solde GSM)</span>
            </button>
            <button
              type="button"
              onClick={() => setServiceSubTab('factures')}
              className={`py-2.5 px-3 rounded-lg font-bold text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer ${
                serviceSubTab === 'factures'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Receipt className="w-4 h-4" />
              <span>Paiement de Factures Référencées</span>
            </button>
          </div>

          {/* SUB-VIEW 1: RECHARGE TÉLÉPHONIQUE DIRECTE (Telecom / Ooredoo / Orange) */}
          {serviceSubTab === 'recharge' && (
            <div className="space-y-5">
              {/* Success Feedback */}
              {rechargeSuccess && (
                <div className="bg-emerald-950/90 border border-emerald-500/60 rounded-xl p-4 text-emerald-200 text-xs space-y-2 shadow-lg animate-fadeIn">
                  <div className="flex items-center space-x-2 font-bold text-sm text-emerald-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Recharge {rechargeSuccess.operator} validée et créditée avec succès !</span>
                  </div>
                  <p className="text-slate-300 text-xs">
                    Le montant de <strong className="text-white font-mono">{rechargeSuccess.amount.toFixed(3)} TND</strong> a été immédiatement envoyé au numéro <strong className="text-white font-mono">(+216) {rechargeSuccess.phone}</strong>.
                  </p>
                  <div className="text-[11px] text-emerald-400/90 flex items-center justify-between pt-2 border-t border-emerald-900/60 font-mono">
                    <span>Réf transaction: {rechargeSuccess.reference}</span>
                    <span>Date: {rechargeSuccess.date}</span>
                  </div>
                </div>
              )}

              {/* Error Feedback */}
              {rechargeError && (
                <div className="bg-rose-950/90 border border-rose-600 rounded-xl p-3 text-rose-200 text-xs flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{rechargeError}</span>
                </div>
              )}

              <form onSubmit={handleRechargeSubmit} className="space-y-4 text-xs">
                {/* 1. Opérateurs / Lignes de recharge (Telecom / Ooredoo / Orange) */}
                <div>
                  <div className="grid grid-cols-3 gap-3">
                    {/* Tunisie Telecom */}
                    <button
                      key="Telecom"
                      type="button"
                      onClick={() => {
                        setRechargeOperator('Telecom');
                        setRechargeError(null);
                      }}
                      className={`p-3 rounded-xl font-bold cursor-pointer transition-all border flex flex-col items-center justify-center space-y-1.5 relative ${
                        rechargeOperator === 'Telecom'
                          ? 'bg-blue-950/90 border-blue-500 text-white ring-2 ring-blue-500/50 shadow-lg'
                          : 'bg-slate-900 text-slate-400 border-slate-700 hover:border-slate-600 hover:text-white'
                      }`}
                    >
                      <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-xs shadow-md">
                        TT
                      </div>
                      <span className="text-xs font-bold text-white">Telecom</span>
                      <span className="text-[10px] text-blue-400 font-normal">Tunisie Telecom</span>
                      {rechargeOperator === 'Telecom' && (
                        <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                      )}
                    </button>

                    {/* Ooredoo */}
                    <button
                      key="Ooredoo"
                      type="button"
                      onClick={() => {
                        setRechargeOperator('Ooredoo');
                        setRechargeError(null);
                      }}
                      className={`p-3 rounded-xl font-bold cursor-pointer transition-all border flex flex-col items-center justify-center space-y-1.5 relative ${
                        rechargeOperator === 'Ooredoo'
                          ? 'bg-red-950/90 border-red-500 text-white ring-2 ring-red-500/50 shadow-lg'
                          : 'bg-slate-900 text-slate-400 border-slate-700 hover:border-slate-600 hover:text-white'
                      }`}
                    >
                      <div className="w-9 h-9 rounded-xl bg-red-600 flex items-center justify-center text-white font-black text-[10px] shadow-md">
                        oo
                      </div>
                      <span className="text-xs font-bold text-white">Ooredoo</span>
                      <span className="text-[10px] text-red-400 font-normal">Ooredoo Tunisie</span>
                      {rechargeOperator === 'Ooredoo' && (
                        <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                      )}
                    </button>

                    {/* Orange */}
                    <button
                      key="Orange"
                      type="button"
                      onClick={() => {
                        setRechargeOperator('Orange');
                        setRechargeError(null);
                      }}
                      className={`p-3 rounded-xl font-bold cursor-pointer transition-all border flex flex-col items-center justify-center space-y-1.5 relative ${
                        rechargeOperator === 'Orange'
                          ? 'bg-orange-950/90 border-orange-500 text-white ring-2 ring-orange-500/50 shadow-lg'
                          : 'bg-slate-900 text-slate-400 border-slate-700 hover:border-slate-600 hover:text-white'
                      }`}
                    >
                      <div className="w-9 h-9 rounded-xl bg-orange-500 flex items-center justify-center text-white font-black text-[11px] shadow-md">
                        OR
                      </div>
                      <span className="text-xs font-bold text-white">Orange</span>
                      <span className="text-[10px] text-orange-400 font-normal">Orange Tunisie</span>
                      {rechargeOperator === 'Orange' && (
                        <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
                      )}
                    </button>
                  </div>
                </div>

                {/* 2. Numéro de téléphone */}
                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">Numéro de téléphone mobile à recharger</label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3 text-slate-300 font-mono font-bold text-xs pointer-events-none flex items-center gap-1.5">
                      <span>🇹🇳</span>
                      <span>+216</span>
                      <span className="text-slate-600">|</span>
                    </span>
                    <input
                      type="tel"
                      required
                      maxLength={8}
                      value={rechargePhone}
                      onChange={(e) => setRechargePhone(e.target.value.replace(/\D/g, ''))}
                      placeholder={rechargeOperator === 'Telecom' ? '98 xxx xxx' : rechargeOperator === 'Ooredoo' ? '22 xxx xxx' : '55 xxx xxx'}
                      className="w-full bg-slate-900 border border-slate-600 rounded-xl pl-24 pr-4 py-2.5 text-white font-mono text-sm tracking-wider focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* 3. Montant de la recharge avec presets */}
                <div>
                  <label className="block text-slate-300 font-bold mb-2">Montant de la recharge (TND)</label>

                  {/* Preset buttons */}
                  <div className="grid grid-cols-6 gap-2">
                    {[5, 10, 15, 20, 25, 50].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setRechargeAmount(String(val))}
                        className={`py-2 rounded-lg border font-mono font-bold text-xs transition-all cursor-pointer ${
                          rechargeAmount === String(val)
                            ? 'bg-blue-600 text-white border-blue-400 shadow'
                            : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800'
                        }`}
                      >
                        {val} DT
                      </button>
                    ))}
                  </div>
                </div>

                {/* Compte Débiteur Info */}
                <div className="bg-slate-900/80 border border-slate-700/80 rounded-xl p-3 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Compte BNA à débiter</span>
                    <span className="text-xs font-mono font-bold text-slate-200">{accounts[0]?.accountNumber || '03 000 01001234567 89'}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Solde Disponible</span>
                    <span className="text-xs font-mono font-bold text-emerald-400">
                      {accounts[0]?.balance.toLocaleString('fr-FR', { minimumFractionDigits: 3 })} TND
                    </span>
                  </div>
                </div>

                {/* Action Submit Button */}
                <button
                  type="submit"
                  className={`w-full text-white font-bold py-3.5 rounded-xl shadow-lg transition-all cursor-pointer flex items-center justify-center space-x-2 text-sm ${
                    rechargeOperator === 'Telecom'
                      ? 'bg-blue-600 hover:bg-blue-500 shadow-blue-900/30'
                      : rechargeOperator === 'Ooredoo'
                      ? 'bg-red-600 hover:bg-red-500 shadow-red-900/30'
                      : 'bg-orange-600 hover:bg-orange-500 shadow-orange-900/30'
                  }`}
                >
                  <Zap className="w-4 h-4 fill-current" />
                  <span>
                    Confirmer la Recharge {rechargeOperator === 'Telecom' ? 'Tunisie Telecom' : rechargeOperator} ({parseFloat(rechargeAmount) || 0} TND)
                  </span>
                </button>
              </form>
            </div>
          )}

          {/* SUB-VIEW 2: PAIEMENT DE FACTURES (STEG / SONEDE / Telecom) */}
          {serviceSubTab === 'factures' && (
            <div className="space-y-6">
              <div className="border-b border-slate-700 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">
                    Paiement de Factures Référencées
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Réglez vos factures courantes d'énergie, d'eau et de télécommunication
                  </p>
                </div>
              </div>

              {invoiceSuccess && (
                <div className="bg-emerald-950 border border-emerald-600 rounded-xl p-4 text-emerald-200 text-xs font-bold">
                  ✓ Facture {invoiceProvider} réglée avec succès ! Reçu disponible.
                </div>
              )}

              <form onSubmit={handlePayInvoice} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Organisme / Fournisseur</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['STEG', 'SONEDE', 'Telecom'] as const).map(provider => (
                      <button
                        key={provider}
                        type="button"
                        onClick={() => setInvoiceProvider(provider)}
                        className={`py-2 rounded-xl font-bold cursor-pointer transition-all ${
                          invoiceProvider === provider
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-900 text-slate-400 border border-slate-700'
                        }`}
                      >
                        {provider}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Référence Facture {invoiceProvider}</label>
                  <input
                    type="text"
                    required
                    value={invoiceRef}
                    onChange={(e) => setInvoiceRef(e.target.value)}
                    placeholder="ex: 8840291002"
                    className="w-full bg-slate-900 border border-slate-600 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Montant à régler (TND)</label>
                  <input
                    type="text"
                    value={invoiceAmount}
                    onChange={(e) => setInvoiceAmount(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-600 rounded-xl px-3 py-2 text-white font-mono text-base font-bold"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl shadow-lg cursor-pointer"
                >
                  Payer la Facture {invoiceProvider}
                </button>
              </form>
            </div>
          )}
        </div>
      )}

      {/* TAB 5: Cours des Devises & Convertisseur */}
      {activeTab === 'devises' && (
        <div className="space-y-4">
          <CurrencyExchangeWidget />
        </div>
      )}

    </div>
  );
};
