import React, { useState } from 'react';
import { UserAccount, ApplicationPack } from '../types';
import { MOCK_PACKS } from '../data/mockData';
import { 
  KeyRound, 
  Layers, 
  Grid, 
  CheckSquare, 
  Plus, 
  Check, 
  X, 
  Edit2, 
  ShieldAlert, 
  ToggleLeft, 
  ToggleRight, 
  PackageCheck
} from 'lucide-react';

interface AdminPageProps {
  currentUser: UserAccount;
}

export const AdminPage: React.FC<AdminPageProps> = ({ currentUser }) => {
  const [activeTab, setActiveTab] = useState<'apps' | 'profiles' | 'packs'>('apps');
  const [packsList, setPacksList] = useState<ApplicationPack[]>(MOCK_PACKS);

  // Apps status state
  const [appsStatus, setAppsStatus] = useState([
    { id: 'app-1', name: 'Module Virements & Bénéficiaires', code: 'MOD-VIR', status: true, usersCount: 84200 },
    { id: 'app-2', name: 'Module Cartes Bancaires & Plafonds', code: 'MOD-CAR', status: true, usersCount: 110500 },
    { id: 'app-3', name: 'Module Paiement STEG / SONEDE / Telecom', code: 'MOD-FAC', status: true, usersCount: 65000 },
    { id: 'app-4', name: 'Module Crédits Agricoles Pro', code: 'MOD-AGRI', status: true, usersCount: 12400 },
    { id: 'app-5', name: 'Module Effets & Lettres de Change', code: 'MOD-EFF', status: true, usersCount: 8900 },
    { id: 'app-6', name: 'Module Transferts Mandats Cash', code: 'MOD-MAND', status: true, usersCount: 19300 },
  ]);

  const toggleAppStatus = (id: string) => {
    setAppsStatus(appsStatus.map(app => {
      if (app.id === id) return { ...app, status: !app.status };
      return app;
    }));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Top Banner for Admin Identifiant */}
      <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-slate-900 border border-teal-700/60 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-teal-600 rounded-2xl shadow-lg border border-teal-400/30">
            <KeyRound className="w-8 h-8 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-extrabold text-white">
                Espace Administrateur Fonctionnel BNA
              </h1>
              <span className="bg-teal-400 text-slate-950 font-mono font-bold text-xs px-2.5 py-1 rounded-full shadow">
                {currentUser.identifiant}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Gestion des Applications • Profils & Menus • Packs E-Banking • Attribution des Droits
            </p>
          </div>
        </div>

        <div className="bg-slate-800/80 border border-slate-700 px-3 py-2 rounded-xl text-right">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Identifiant Validation</span>
          <span className="text-xs font-mono font-bold text-teal-300">ADMIN-BK42Xp OK</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('apps')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'apps'
              ? 'bg-teal-600 text-white shadow-md'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Gestion des Applications</span>
        </button>

        <button
          onClick={() => setActiveTab('profiles')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'profiles'
              ? 'bg-teal-600 text-white shadow-md'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <Grid className="w-4 h-4" />
          <span>Profils & Menus d'Accès</span>
        </button>

        <button
          onClick={() => setActiveTab('packs')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'packs'
              ? 'bg-teal-600 text-white shadow-md'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <PackageCheck className="w-4 h-4" />
          <span>Packs & Droits ({packsList.length})</span>
        </button>
      </div>

      {/* TAB 1: Gestion des Applications */}
      {activeTab === 'apps' && (
        <div className="space-y-6">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
            <h3 className="text-base font-bold text-white mb-1">Modules E-Banking Déployés</h3>
            <p className="text-xs text-slate-400 mb-6">
              Activez ou désactivez les micro-services accessibles aux utilisateurs finaux.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {appsStatus.map((app) => (
                <div key={app.id} className="bg-slate-900/90 border border-slate-700/80 rounded-2xl p-5 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono font-bold bg-slate-800 text-teal-300 px-2 py-0.5 rounded">
                        {app.code}
                      </span>
                      <h4 className="font-bold text-sm text-white mt-1.5">{app.name}</h4>
                    </div>
                    <button
                      onClick={() => toggleAppStatus(app.id)}
                      className="cursor-pointer transition-all"
                    >
                      {app.status ? (
                        <ToggleRight className="w-8 h-8 text-teal-400" />
                      ) : (
                        <ToggleLeft className="w-8 h-8 text-slate-600" />
                      )}
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800 text-slate-400">
                    <span>Utilisateurs rattachés</span>
                    <span className="font-mono text-white font-bold">{app.usersCount.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Profils & Menus */}
      {activeTab === 'profiles' && (
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 space-y-6">
          <h3 className="text-base font-bold text-white">Attribution des Menus par Profil</h3>
          <p className="text-xs text-slate-400">
            Définissez l'arborescence des sous-menus pour Particuliers, Professionnels et Administrateurs.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-900 p-5 rounded-2xl border border-slate-700 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h4 className="font-bold text-sm text-blue-400">Arborescence Profil Particulier</h4>
                <span className="text-[10px] bg-blue-950 text-blue-300 px-2 py-0.5 rounded">Menu Client</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-center gap-2 bg-slate-800/60 p-2 rounded-lg">
                  <Check className="w-4 h-4 text-emerald-400" /> Dashboard Consolidé & Comptes
                </li>
                <li className="flex items-center gap-2 bg-slate-800/60 p-2 rounded-lg">
                  <Check className="w-4 h-4 text-emerald-400" /> Cartes Bancaires (Activation/Plafonds)
                </li>
                <li className="flex items-center gap-2 bg-slate-800/60 p-2 rounded-lg">
                  <Check className="w-4 h-4 text-emerald-400" /> Virements Simples & Permanents
                </li>
                <li className="flex items-center gap-2 bg-slate-800/60 p-2 rounded-lg">
                  <Check className="w-4 h-4 text-emerald-400" /> Factures (STEG / SONEDE / TT)
                </li>
              </ul>
            </div>

            <div className="bg-slate-900 p-5 rounded-2xl border border-slate-700 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h4 className="font-bold text-sm text-amber-400">Arborescence Profil Professionnel</h4>
                <span className="text-[10px] bg-amber-950 text-amber-300 px-2 py-0.5 rounded">Menu Entreprise</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-center gap-2 bg-slate-800/60 p-2 rounded-lg">
                  <Check className="w-4 h-4 text-emerald-400" /> Crédits Agricoles & Campagnes
                </li>
                <li className="flex items-center gap-2 bg-slate-800/60 p-2 rounded-lg">
                  <Check className="w-4 h-4 text-emerald-400" /> Effets de Commerce & Lettres de Change
                </li>
                <li className="flex items-center gap-2 bg-slate-800/60 p-2 rounded-lg">
                  <Check className="w-4 h-4 text-emerald-400" /> Mandats Cash Nationaux
                </li>
                <li className="flex items-center gap-2 bg-slate-800/60 p-2 rounded-lg">
                  <Check className="w-4 h-4 text-emerald-400" /> Virements Multiples de Masse (Paie)
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Packs & Droits */}
      {activeTab === 'packs' && (
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-700 pb-4">
            <div>
              <h3 className="text-base font-bold text-white">Catalogue des Packs E-Banking</h3>
              <p className="text-xs text-slate-400">Associez un ensemble de fonctionnalités à un abonnement d'accès.</p>
            </div>
            <button
              onClick={() => alert("Nouveau pack créé")}
              className="bg-teal-600 hover:bg-teal-500 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center space-x-2 cursor-pointer shadow"
            >
              <Plus className="w-4 h-4" />
              <span>Créer un Pack</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {packsList.map((pack) => (
              <div key={pack.id} className="bg-slate-900 border border-slate-700 rounded-2xl p-5 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono bg-teal-950 text-teal-300 px-2 py-0.5 rounded border border-teal-800">
                      {pack.code}
                    </span>
                    <h4 className="font-bold text-sm text-white mt-1.5">{pack.name}</h4>
                  </div>
                  <span className="text-[10px] bg-emerald-900 text-emerald-300 font-bold px-2 py-0.5 rounded-full">
                    {pack.status}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-300">
                  <p className="font-bold text-teal-400 text-[11px] uppercase">Droits Inclus :</p>
                  {pack.rights.map((right, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 text-slate-300 text-[11px]">
                      <Check className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                      <span>{right}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
