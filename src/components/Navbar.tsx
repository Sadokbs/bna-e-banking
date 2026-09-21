import React, { useState, useEffect } from 'react';
import { UserAccount, StoredUserAccount } from '../types';
import { DatabaseViewerModal } from './DatabaseViewerModal';
import { CurrencyModal } from './CurrencyModal';
import { BnaLogo } from './BnaLogo';
import { fetchLiveCurrencyRates } from '../services/currencyService';
import { 
  ShieldCheck, 
  LogOut, 
  User, 
  Building2, 
  KeyRound, 
  UserCheck, 
  Lock, 
  Bell,
  Database,
  Eye,
  Coins,
  TrendingUp
} from 'lucide-react';

interface NavbarProps {
  currentUser: UserAccount | null;
  onLogout: () => void;
  onSelectIdentifiant: (identifiant: string) => void;
  onSelectUserFromDb?: (user: StoredUserAccount) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  currentUser, 
  onLogout,
  onSelectIdentifiant,
  onSelectUserFromDb
}) => {
  const [isDbOpen, setIsDbOpen] = useState(false);
  const [isCurrencyOpen, setIsCurrencyOpen] = useState(false);
  const [eurRate, setEurRate] = useState<number>(3.385);
  const [usdRate, setUsdRate] = useState<number>(3.125);

  useEffect(() => {
    fetchLiveCurrencyRates(false).then((res) => {
      const eur = res.rates.find((r) => r.code === 'EUR');
      const usd = res.rates.find((r) => r.code === 'USD');
      if (eur) setEurRate(eur.middleRate);
      if (usd) setUsdRate(usd.middleRate);
    });
  }, []);

  const getRoleIcon = (role?: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return <ShieldCheck className="w-5 h-5 text-emerald-400" />;
      case 'ADMIN':
        return <KeyRound className="w-5 h-5 text-teal-300" />;
      case 'CLIENT_PROFESSIONNEL':
        return <Building2 className="w-5 h-5 text-amber-300" />;
      case 'CLIENT_PARTICULIER':
      default:
        return <User className="w-5 h-5 text-blue-300" />;
    }
  };

  return (
    <header className="bg-slate-900 border-b border-emerald-800/40 text-white sticky top-0 z-50 shadow-md">
      {/* Top micro bar */}
      <div className="bg-emerald-950/80 border-b border-emerald-900/50 px-4 py-1 text-xs text-emerald-300 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className="flex items-center gap-1 font-medium text-emerald-400">
            <Lock className="w-3.5 h-3.5" />
            E-Banking Sécurisé BNA
          </span>
          <span className="hidden sm:inline text-emerald-600">|</span>
          <button
            type="button"
            onClick={() => setIsCurrencyOpen(true)}
            className="hidden sm:flex items-center space-x-2 text-[11px] text-slate-300 hover:text-emerald-300 transition-colors cursor-pointer"
            title="Cliquez pour ouvrir le convertisseur et tous les cours de change BNA en direct"
          >
            <Coins className="w-3 h-3 text-emerald-400" />
            <span>Devises TND :</span>
            <span className="font-mono text-emerald-400 font-bold">1€ = {eurRate.toFixed(3)} DT</span>
            <span className="text-slate-500">•</span>
            <span className="font-mono text-blue-400 font-bold">1$ = {usdRate.toFixed(3)} DT</span>
            <span className="text-emerald-400/80 text-[10px] underline ml-1">Live • Convertir →</span>
          </button>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-emerald-400 font-mono text-[11px]">
            {currentUser ? `ID ACTIF: ${currentUser.identifiant}` : 'NON CONNECTÉ'}
          </span>
          <span className="text-slate-400 hidden md:inline">24/7 Assistance : 71 830 000</span>
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center shadow-lg border border-emerald-500/40 p-1.5 shrink-0">
            <BnaLogo className="w-full h-full" variant="emerald" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold tracking-tight text-lg text-white">
                BNA <span className="text-emerald-400">E-Banking</span>
              </span>
              <span className="bg-emerald-900/80 text-emerald-300 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-emerald-700/50">
                OFFICIEL
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              Banque Nationale Agricole
            </p>
          </div>
        </div>

        {/* Right User Actions & Database Explorer Button (Strictly Super Admin) */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Real-time Currency Exchange Button */}
          <button
            onClick={() => setIsCurrencyOpen(true)}
            className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-300 hover:text-white border border-emerald-500/40 hover:border-emerald-400 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer"
            title="Consulter le cours des devises en direct (EUR, USD, GBP, SAR...) et convertir en Dinars Tunisiens"
          >
            <Coins className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Cours des Devises</span>
            <span className="text-[10px] font-mono bg-emerald-950 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-700/50">
              1€ = {eurRate.toFixed(3)} DT
            </span>
          </button>

          {/* Prominent Database Viewer Button - EXCLUSIVELY FOR SUPER ADMIN */}
          {currentUser && currentUser.role === 'SUPER_ADMIN' && (
            <button
              onClick={() => setIsDbOpen(true)}
              className="flex items-center space-x-1.5 bg-emerald-950/90 hover:bg-emerald-900 text-emerald-300 hover:text-emerald-200 border border-emerald-500/60 hover:border-emerald-400 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer"
              title="Ouvrir l'inspecteur de la base de données et des empreintes SHA-256 (Réservé Super Admin)"
            >
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden xs:inline">قاعدة البيانات</span>
              <span className="text-[10px] bg-emerald-900/90 text-emerald-200 border border-emerald-700/60 px-1.5 py-0.2 rounded font-mono hidden sm:inline">
                Super Admin DB
              </span>
            </button>
          )}

          {currentUser ? (
            <div className="flex items-center space-x-3 sm:space-x-4">
              {/* User Badge */}
              <div className="hidden md:flex items-center space-x-3 bg-slate-800/90 border border-slate-700/80 rounded-lg px-3 py-1.5">
                <div className="p-1 bg-slate-700/60 rounded-md">
                  {getRoleIcon(currentUser.role)}
                </div>
                <div>
                  <div className="flex items-center space-x-1.5">
                    <span className="text-xs font-bold text-white tracking-wide">
                      {currentUser.name}
                    </span>
                    <span className="text-[10px] bg-emerald-950 text-emerald-300 px-1.5 py-0.2 rounded border border-emerald-800/60 font-mono">
                      {currentUser.identifiant}
                    </span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-medium">
                    {currentUser.role.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>

              {/* Notification icon */}
              <button 
                className="relative p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                title="Notifications de sécurité"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full"></span>
              </button>

              {/* Logout Button */}
              <button
                onClick={onLogout}
                className="flex items-center space-x-1.5 bg-rose-950/80 hover:bg-rose-900 text-rose-300 hover:text-rose-100 border border-rose-800/50 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-sm cursor-pointer"
                title="Déconnexion sécurisée"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Déconnexion</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2 text-xs">
              <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Connexion Chiffrée TLS 1.3
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Currency Exchange Rates & Converter Modal */}
      <CurrencyModal
        isOpen={isCurrencyOpen}
        onClose={() => setIsCurrencyOpen(false)}
      />

      {/* Global Database Viewer Modal */}
      <DatabaseViewerModal
        isOpen={isDbOpen}
        onClose={() => setIsDbOpen(false)}
        onSelectUser={(user) => {
          setIsDbOpen(false);
          if (onSelectUserFromDb) {
            onSelectUserFromDb(user);
          } else {
            onSelectIdentifiant(user.identifiant);
          }
        }}
      />
    </header>
  );
};

export default Navbar;
