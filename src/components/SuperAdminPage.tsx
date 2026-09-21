import React, { useState } from 'react';
import { UserAccount, AdminUser, SystemAuditLog, BankAccount } from '../types';
import { MOCK_ADMIN_USERS, MOCK_AUDIT_LOGS, MOCK_ACCOUNTS_PARTICULIER, MOCK_ACCOUNTS_PRO } from '../data/mockData';
import { DatabaseViewerModal } from './DatabaseViewerModal';
import { BnaLogo } from './BnaLogo';
import { 
  ShieldCheck, 
  Users, 
  Settings, 
  Activity, 
  Database, 
  Plus, 
  Search, 
  Trash2, 
  Edit, 
  CheckCircle, 
  AlertTriangle, 
  RefreshCw, 
  Server, 
  Lock, 
  Unlock,
  Filter,
  FileSpreadsheet,
  Download,
  Building2,
  KeyRound,
  TrendingUp,
  BarChart3,
  Eye,
  X,
  ShieldAlert,
  Check,
  Clock,
  Globe,
  UserCheck,
  UserX,
  ChevronRight,
  AlertCircle,
  Ban,
  Layers
} from 'lucide-react';

interface SuperAdminPageProps {
  currentUser: UserAccount;
}

interface BnaBranch {
  id: string;
  code: string;
  name: string;
  region: string;
  manager: string;
  status: 'Ouverte' | 'Fermée' | 'En Rénovation';
  clientCount: number;
}

interface HighRiskOp {
  id: string;
  reference: string;
  type: string;
  amount: number;
  client: string;
  account: string;
  riskLevel: 'ÉLEVÉ' | 'CRITIQUE' | 'MOYEN';
  status: 'En Attente' | 'Approuvé' | 'Bloqué';
  timestamp: string;
}

const INITIAL_BRANCHES: BnaBranch[] = [
  { id: 'br-1', code: '03001', name: 'Agence Tunis Habib Bourguiba (Siège)', region: 'Tunis Grand Tunis', manager: 'M. Hassen Mansouri', status: 'Ouverte', clientCount: 14200 },
  { id: 'br-2', code: '03084', name: 'Agence Bizerte Ville', region: 'Bizerte / Nord', manager: 'Mme. Olfa Chaabane', status: 'Ouverte', clientCount: 8900 },
  { id: 'br-3', code: '03012', name: 'Agence Sfax Rpublique', region: 'Sfax / Sud', manager: 'M. Wissem Hammami', status: 'Ouverte', clientCount: 11400 },
  { id: 'br-4', code: '03045', name: 'Agence Sousse Corniche', region: 'Sousse / Sahel', manager: 'Mme. Leila Ben Amara', status: 'Ouverte', clientCount: 9600 },
  { id: 'br-5', code: '03022', name: 'Agence Nabeul Les Palmiers', region: 'Nabeul / Cap Bon', manager: 'M. Ridha Khelifi', status: 'Ouverte', clientCount: 6500 },
];

const INITIAL_HIGH_RISK_OPS: HighRiskOp[] = [
  { id: 'op-1', reference: 'VIR-INT-2026-901', type: 'Virement International Swift', amount: 125000, client: 'Société AgriNord SARL', account: 'TN59 0308 4000 8899 1124 4011', riskLevel: 'CRITIQUE', status: 'En Attente', timestamp: 'Aujourd\'hui à 10:14' },
  { id: 'op-2', reference: 'CHQ-CERT-88102', type: 'Certification Chèque Montant Élevé', amount: 85000, client: 'Comptoir Agricole du Centre', account: 'TN59 0300 1000 9876 5432 1098', riskLevel: 'ÉLEVÉ', status: 'En Attente', timestamp: 'Aujourd\'hui à 09:42' },
  { id: 'op-3', reference: 'OP-MASS-00412', type: 'Virement de Masse Paie (240 employés)', amount: 310000, client: 'Groupe Céréalier de la Medjerda', account: 'TN59 0301 2000 4455 6677 8899', riskLevel: 'MOYEN', status: 'En Attente', timestamp: 'Hier à 17:05' },
];

export const SuperAdminPage: React.FC<SuperAdminPageProps> = ({ currentUser }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'supervision' | 'audit' | 'admins' | 'entities' | 'config'>('overview');
  const [entitySubTab, setEntitySubTab] = useState<'accounts' | 'agencies' | 'roles'>('accounts');
  const [isDbViewerModalOpen, setIsDbViewerModalOpen] = useState<boolean>(false);

  // Toasts Notification
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // State
  const [adminsList, setAdminsList] = useState<AdminUser[]>(MOCK_ADMIN_USERS);
  const [auditLogs, setAuditLogs] = useState<SystemAuditLog[]>(MOCK_AUDIT_LOGS);
  const [allAccounts, setAllAccounts] = useState<BankAccount[]>([...MOCK_ACCOUNTS_PARTICULIER, ...MOCK_ACCOUNTS_PRO]);
  const [branchesList, setBranchesList] = useState<BnaBranch[]>(INITIAL_BRANCHES);
  const [highRiskOps, setHighRiskOps] = useState<HighRiskOp[]>(INITIAL_HIGH_RISK_OPS);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [auditFilter, setAuditFilter] = useState<string>('ALL');

  // Modals for Admin CRUD
  const [showAddAdminModal, setShowAddAdminModal] = useState<boolean>(false);
  const [editingAdmin, setEditingAdmin] = useState<AdminUser | null>(null);
  const [deletingAdminId, setDeletingAdminId] = useState<string | null>(null);

  // Admin Form Fields
  const [adminName, setAdminName] = useState<string>('');
  const [adminEmail, setAdminEmail] = useState<string>('');
  const [adminRole, setAdminRole] = useState<'Admin' | 'Support' | 'Auditeur'>('Admin');

  // Modals for Client Accounts CRUD
  const [showAddAccountModal, setShowAddAccountModal] = useState<boolean>(false);
  const [newAccNum, setNewAccNum] = useState<string>('');
  const [newAccType, setNewAccType] = useState<string>('Compte Chèque Particulier');
  const [newAccBalance, setNewAccBalance] = useState<number>(5000);

  // Config State
  const [requireOtp, setRequireOtp] = useState<boolean>(true);
  const [sessionDuration, setSessionDuration] = useState<number>(15);
  const [passwordComplexity, setPasswordComplexity] = useState<string>('Élevée (Chiffre, Symbole, Majuscule, Min 12 car.)');
  const [antiBruteForce, setAntiBruteForce] = useState<boolean>(true);
  const [maintenanceMode, setMaintenanceMode] = useState<boolean>(false);
  
  const [instantTransferLimit, setInstantTransferLimit] = useState<number>(5000);
  const [standardTransferLimit, setStandardTransferLimit] = useState<number>(50000);
  const [otpProvider, setOtpProvider] = useState<string>('Tunisie Télécom & Ooredoo Gateway');
  const [backupFrequency, setBackupFrequency] = useState<string>('Toutes les 6 heures (Chiffrée)');

  // Handle Admin CRUD
  const handleOpenAddAdmin = () => {
    setAdminName('');
    setAdminEmail('');
    setAdminRole('Admin');
    setEditingAdmin(null);
    setShowAddAdminModal(true);
  };

  const handleOpenEditAdmin = (admin: AdminUser) => {
    setEditingAdmin(admin);
    setAdminName(admin.name);
    setAdminEmail(admin.email);
    setAdminRole(admin.role as any);
    setShowAddAdminModal(true);
  };

  const handleSaveAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminName || !adminEmail) return;

    if (editingAdmin) {
      setAdminsList(adminsList.map(a => a.id === editingAdmin.id ? {
        ...a,
        name: adminName,
        email: adminEmail,
        role: adminRole
      } : a));

      showToast(`Administrateur ${adminName} mis à jour.`);
      addAuditLog('MODIFICATION_ADMINISTRATEUR', `Mis à jour des informations de ${adminName}`);
    } else {
      const newAdmin: AdminUser = {
        id: `adm-${Date.now()}`,
        name: adminName,
        email: adminEmail,
        role: adminRole,
        status: 'actif',
        lastLogin: 'Jamais connecté',
        permissions: ['Gestion Profils', 'Consultation Logs']
      };

      setAdminsList([newAdmin, ...adminsList]);
      showToast(`Nouvel administrateur ${adminName} créé avec succès.`);
      addAuditLog('CREATION_ADMINISTRATEUR', `Création du compte administrateur ${adminName} (${adminRole})`);
    }

    setShowAddAdminModal(false);
  };

  const handleToggleAdminStatus = (id: string, name: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'actif' ? 'inactif' : 'actif';
    setAdminsList(adminsList.map(a => a.id === id ? { ...a, status: nextStatus } : a));
    showToast(`Statut de ${name} passé à ${nextStatus.toUpperCase()}`);
    addAuditLog('STATUT_ADMIN_TOGGLE', `Changement du statut de l'admin ${name} à ${nextStatus}`);
  };

  const handleDeleteAdminConfirm = () => {
    if (!deletingAdminId) return;
    const adminToDelete = adminsList.find(a => a.id === deletingAdminId);
    setAdminsList(adminsList.filter(a => a.id !== deletingAdminId));
    setDeletingAdminId(null);
    if (adminToDelete) {
      showToast(`Administrateur ${adminToDelete.name} supprimé.`, 'info');
      addAuditLog('SUPPRESSION_ADMINISTRATEUR', `Suppression définitive du compte ${adminToDelete.name}`);
    }
  };

  // Handle Client Account Lock/Unlock
  const handleToggleAccountStatus = (accId: string, accNum: string, currentStatus: string) => {
    const nextStatus: 'active' | 'blocked' = currentStatus === 'active' ? 'blocked' : 'active';
    setAllAccounts(allAccounts.map(a => a.id === accId ? { ...a, status: nextStatus } : a));
    showToast(`Compte N° ${accNum} ${nextStatus === 'blocked' ? 'Verrouillé' : 'Déverrouillé'}.`);
    addAuditLog('MODIFICATION_STATUT_COMPTE', `${nextStatus === 'blocked' ? 'Blocage' : 'Déblocage'} du compte client ${accNum}`);
  };

  const handleAddAccountSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccNum) return;

    const created: BankAccount = {
      id: `acc-created-${Date.now()}`,
      accountNumber: newAccNum,
      rib: `03001${newAccNum.replace(/\s/g, '')}`,
      iban: `TN59 0300 1000 ${newAccNum.slice(-8)}`,
      type: newAccType,
      balance: newAccBalance,
      currency: 'TND',
      status: 'active'
    };

    setAllAccounts([created, ...allAccounts]);
    setShowAddAccountModal(false);
    showToast(`Compte client ${newAccNum} créé.`);
    addAuditLog('CREATION_COMPTE_CLIENT', `Nouveau compte client ${newAccNum} (${newAccType}) créé.`);
  };

  // High Risk Operations Actions
  const handleApproveOp = (opId: string, ref: string) => {
    setHighRiskOps(highRiskOps.map(op => op.id === opId ? { ...op, status: 'Approuvé' } : op));
    showToast(`Opération à risque ${ref} approuvée.`, 'success');
    addAuditLog('VALIDATION_OPERATION_RISQUE', `Approbation manuelle de l'opération ${ref} par le Super Admin`);
  };

  const handleBlockOp = (opId: string, ref: string) => {
    setHighRiskOps(highRiskOps.map(op => op.id === opId ? { ...op, status: 'Bloqué' } : op));
    showToast(`Opération à risque ${ref} bloquée!`, 'error');
    addAuditLog('BLOCAGE_OPERATION_RISQUE', `Refus et blocage de l'opération à risque ${ref}`);
  };

  // Config Save
  const handleSaveConfig = () => {
    showToast('Configuration Système BNA enregistrée avec succès.');
    addAuditLog('UPDATE_CONFIG_SYSTEME', `Mise à jour globale des paramètres de sécurité et des plafonds réseau`);
  };

  // Audit Log Helper
  const addAuditLog = (action: string, details: string) => {
    const newLog: SystemAuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleString('fr-FR'),
      user: currentUser.identifiant,
      action: action,
      ipAddress: '196.203.112.45',
      status: 'SUCCÈS',
      details: details
    };
    setAuditLogs([newLog, ...auditLogs]);
  };

  // Filtered lists
  const filteredAuditLogs = auditLogs.filter(log => {
    const matchesFilter = auditFilter === 'ALL' || log.status === auditFilter;
    const matchesQuery = !searchQuery || 
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesQuery;
  });

  const filteredAdmins = adminsList.filter(a => 
    !searchQuery || 
    a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredAccounts = allAccounts.filter(a =>
    !searchQuery ||
    a.accountNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.iban.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row font-sans">
      
      {/* Toast Notification Floating Banner */}
      {toastMessage && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-2xl shadow-2xl border flex items-center space-x-3 transition-all transform translate-y-0 animate-bounce ${
          toastMessage.type === 'success' 
            ? 'bg-emerald-900/95 border-emerald-500/80 text-emerald-100'
            : toastMessage.type === 'error'
            ? 'bg-rose-900/95 border-rose-500/80 text-rose-100'
            : 'bg-slate-800/95 border-slate-600 text-slate-100'
        }`}>
          {toastMessage.type === 'success' && <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />}
          {toastMessage.type === 'error' && <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />}
          {toastMessage.type === 'info' && <Check className="w-5 h-5 text-sky-400 shrink-0" />}
          <span className="text-xs font-bold font-sans">{toastMessage.text}</span>
        </div>
      )}

      {/* LEFT SIDEBAR NAVIGATION */}
      <aside className="w-full md:w-64 bg-slate-900/90 border-r border-slate-800/80 flex flex-col shrink-0">
        
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800/80 flex items-center space-x-3">
          <div className="w-10 h-10 bg-slate-950 rounded-2xl shadow-lg border border-emerald-500/40 p-1.5 flex items-center justify-center shrink-0">
            <BnaLogo className="w-full h-full" variant="emerald" />
          </div>
          <div>
            <span className="text-sm font-extrabold text-white tracking-wider block">BNA SUPERADMIN</span>
            <span className="text-[10px] text-emerald-400 font-mono font-semibold">Console Centrale DSI</span>
          </div>
        </div>

        {/* User Identity Info */}
        <div className="p-4 mx-3 my-3 bg-slate-950/80 border border-slate-800 rounded-2xl">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-[11px] font-mono text-emerald-400 font-bold">{currentUser.identifiant}</span>
          </div>
          <div className="text-xs font-bold text-white mt-1">{currentUser.name}</div>
          <div className="text-[10px] text-slate-400 truncate">{currentUser.title}</div>
        </div>

        {/* Sidebar Nav Links */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto text-xs font-semibold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-emerald-600 text-white shadow-md font-bold'
                : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Vue d'ensemble</span>
          </button>

          <button
            onClick={() => setActiveTab('supervision')}
            className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
              activeTab === 'supervision'
                ? 'bg-emerald-600 text-white shadow-md font-bold'
                : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Supervision Globale</span>
            {highRiskOps.filter(o => o.status === 'En Attente').length > 0 && (
              <span className="ml-auto bg-amber-500 text-slate-950 font-bold text-[10px] px-1.5 py-0.5 rounded-full">
                {highRiskOps.filter(o => o.status === 'En Attente').length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
              activeTab === 'audit'
                ? 'bg-emerald-600 text-white shadow-md font-bold'
                : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Journal d'Audit Trail</span>
          </button>

          <button
            onClick={() => setActiveTab('admins')}
            className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
              activeTab === 'admins'
                ? 'bg-emerald-600 text-white shadow-md font-bold'
                : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Gestion des Admins ({adminsList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('entities')}
            className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
              activeTab === 'entities'
                ? 'bg-emerald-600 text-white shadow-md font-bold'
                : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Entités & Operations CRUD</span>
          </button>

          <button
            onClick={() => setActiveTab('config')}
            className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
              activeTab === 'config'
                ? 'bg-emerald-600 text-white shadow-md font-bold'
                : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Configuration Système</span>
          </button>

          {/* Dedicated Super Admin Database & SQL Module */}
          <div className="pt-2">
            <button
              onClick={() => setIsDbViewerModalOpen(true)}
              className="w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl transition-all cursor-pointer text-emerald-300 bg-emerald-950/70 hover:bg-emerald-900/90 border border-emerald-500/40 hover:border-emerald-400 font-bold shadow-sm"
              title="Inspecter la base de données, générer les scripts Oracle/MySQL et tester le chiffrement SHA-256"
            >
              <Database className="w-4 h-4 text-emerald-400" />
              <span>Base de Données & SQL</span>
              <span className="ml-auto bg-emerald-900/90 text-emerald-300 border border-emerald-700/60 font-mono text-[9px] px-1.5 py-0.5 rounded">
                Oracle / MySQL
              </span>
            </button>
          </div>
        </nav>

        {/* Footer info inside sidebar */}
        <div className="p-4 border-t border-slate-800/80 text-[10px] text-slate-500 font-mono space-y-1">
          <div>REST API: Spring Boot v3.2.1</div>
          <div>Database: BNA Postgres Primary</div>
          <div className="text-emerald-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            TLS 1.3 Active
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT WORKSPACE */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        
        {/* TOP HEADER BAR */}
        <header className="bg-slate-900/60 border-b border-slate-800/80 p-4 sm:px-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sticky top-0 backdrop-blur z-20">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <span className="text-xs uppercase font-extrabold text-slate-400 tracking-wider">Espace Sécurisé</span>
              <span className="text-slate-600">•</span>
              <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-[11px] px-2.5 py-0.5 rounded-full font-bold">
                {currentUser.identifiant}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3 w-full sm:w-auto">
            {/* Search Input Bar */}
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Rechercher admin, log, compte..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 transition-all placeholder:text-slate-500"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2 text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <button
              onClick={() => setIsDbViewerModalOpen(true)}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/50 hover:border-emerald-400 text-emerald-300 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0"
              title="Consulter et exporter la base de données SQL (Oracle & MySQL)"
            >
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Base de Données & SQL</span>
            </button>

            <button 
              onClick={() => showToast('Mise à jour des métriques du serveur...', 'info')}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700/80 transition-all cursor-pointer"
              title="Rafraîchir les données"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* WORKSPACE BODY */}
        <main className="p-4 sm:p-6 space-y-6 flex-1">
          
          {/* VIEW 1: OVERVIEW / VUE D'ENSEMBLE */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              
              {/* Banner Welcome */}
              <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 border border-emerald-700/50 rounded-2xl p-6 shadow-xl relative overflow-hidden">
                <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center space-x-3">
                      <h1 className="text-xl sm:text-2xl font-extrabold text-white">
                        Console de Super Administration BNA E-Banking
                      </h1>
                      <span className="bg-emerald-500 text-slate-950 font-bold font-mono text-[11px] px-2.5 py-0.5 rounded-full">
                        SÉCURITÉ MAX
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                      Bienvenue, <strong className="text-white">{currentUser.name}</strong>. Supervision globale de la plateforme, gestion des habilitations administrateurs, contrôle des entités et audit trail centralisé.
                    </p>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <button
                      onClick={() => setIsDbViewerModalOpen(true)}
                      className="bg-slate-800 hover:bg-emerald-950/80 text-emerald-300 hover:text-emerald-200 border border-emerald-500/50 hover:border-emerald-400 font-bold px-3.5 py-2 rounded-xl text-xs flex items-center space-x-1.5 cursor-pointer transition-all shadow"
                    >
                      <Database className="w-4 h-4 text-emerald-400" />
                      <span>Base de Données & SQL</span>
                    </button>
                    <button
                      onClick={handleOpenAddAdmin}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center space-x-2 cursor-pointer shadow transition-all"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Ajouter Admin</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400">Comptes Clients Actifs</span>
                    <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
                      <Users className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="text-2xl font-black text-white font-mono">148,420</div>
                  <div className="text-[11px] text-emerald-400 flex items-center gap-1 font-semibold">
                    <TrendingUp className="w-3.5 h-3.5" /> +4.2% ce mois-ci
                  </div>
                </div>

                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400">Transactions Aujourd'hui</span>
                    <div className="p-2 bg-blue-500/10 text-blue-400 rounded-xl">
                      <BarChart3 className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="text-2xl font-black text-white font-mono">2,482,900 TND</div>
                  <div className="text-[11px] text-slate-400">1,840 mouvements validés</div>
                </div>

                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400">Alertes Sécurité Ouvertes</span>
                    <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="text-2xl font-black text-amber-400 font-mono">
                    {highRiskOps.filter(o => o.status === 'En Attente').length}
                  </div>
                  <div className="text-[11px] text-amber-300">Nécessite approbation manuelle</div>
                </div>

                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400">Admins Système</span>
                    <div className="p-2 bg-purple-500/10 text-purple-400 rounded-xl">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="text-2xl font-black text-white font-mono">{adminsList.length}</div>
                  <div className="text-[11px] text-emerald-400 font-semibold">
                    {adminsList.filter(a => a.status === 'actif').length} comptes actifs
                  </div>
                </div>
              </div>

              {/* Central Operational Panels */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Recent High Risk Alerts Panel */}
                <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-amber-400" />
                      Opérations à Risque Élevé (Validation Requise)
                    </h3>
                    <button 
                      onClick={() => setActiveTab('supervision')}
                      className="text-xs text-emerald-400 hover:underline font-bold flex items-center gap-1"
                    >
                      Voir tout <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="space-y-3">
                    {highRiskOps.slice(0, 3).map((op) => (
                      <div key={op.id} className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                              op.riskLevel === 'CRITIQUE' ? 'bg-rose-900/80 text-rose-300' : 'bg-amber-900/80 text-amber-300'
                            }`}>
                              {op.riskLevel}
                            </span>
                            <span className="font-bold text-white">{op.type}</span>
                            <span className="text-slate-400 font-mono">({op.reference})</span>
                          </div>
                          <div className="text-slate-300">
                            Client: <strong className="text-white">{op.client}</strong> • Montant: <strong className="text-emerald-400 font-mono">{op.amount.toLocaleString('fr-FR')} TND</strong>
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono">{op.timestamp}</div>
                        </div>

                        <div className="flex items-center space-x-2 shrink-0 w-full sm:w-auto justify-end">
                          {op.status === 'En Attente' ? (
                            <>
                              <button
                                onClick={() => handleBlockOp(op.id, op.reference)}
                                className="px-3 py-1.5 bg-rose-900/50 hover:bg-rose-800 text-rose-200 rounded-lg text-xs font-bold border border-rose-700/50 cursor-pointer"
                              >
                                Bloquer
                              </button>
                              <button
                                onClick={() => handleApproveOp(op.id, op.reference)}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold shadow cursor-pointer"
                              >
                                Approuver
                              </button>
                            </>
                          ) : (
                            <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] ${
                              op.status === 'Approuvé' ? 'bg-emerald-900/80 text-emerald-300 border border-emerald-700' : 'bg-rose-900/80 text-rose-300 border border-rose-700'
                            }`}>
                              {op.status.toUpperCase()}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right Quick Status & Services */}
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-3">
                    État de l'Infrastucture
                  </h3>

                  <div className="space-y-3 text-xs">
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                      <span className="text-slate-400 font-medium">Core Banking BNA</span>
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                        Opérationnel (99.98%)
                      </span>
                    </div>

                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                      <span className="text-slate-400 font-medium">Passerelle SMS OTP</span>
                      <span className="text-emerald-400 font-bold">En Ligne</span>
                    </div>

                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                      <span className="text-slate-400 font-medium">Serveur Swift & RTGS</span>
                      <span className="text-emerald-400 font-bold">Connecté</span>
                    </div>

                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                      <span className="text-slate-400 font-medium">Mode Maintenance</span>
                      <span className={`font-bold ${maintenanceMode ? 'text-rose-400' : 'text-slate-400'}`}>
                        {maintenanceMode ? 'ACTIF' : 'Inactif (Normal)'}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={() => setActiveTab('config')}
                      className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs py-2 rounded-xl transition-all cursor-pointer border border-slate-700"
                    >
                      Ouvrir les Paramètres Système
                    </button>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* VIEW 2: SUPERVISION GLOBALE */}
          {activeTab === 'supervision' && (
            <div className="space-y-6">
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                  <div>
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                      <ShieldAlert className="w-5 h-5 text-amber-400" />
                      Supervision Globale & Contrôle des Risques Monétiques
                    </h2>
                    <p className="text-xs text-slate-400">
                      Validation en temps réel des transactions suspectes, virements à haut montant et surveillance réseau.
                    </p>
                  </div>

                  <button
                    onClick={() => showToast('Mise à jour des logs réseau effectuée.')}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold px-3 py-2 rounded-xl border border-slate-700 cursor-pointer"
                  >
                    Actualiser les Alertes
                  </button>
                </div>

                {/* Operations Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950 text-slate-400 uppercase font-semibold">
                      <tr>
                        <th className="p-3.5 rounded-l-xl">Référence & Type</th>
                        <th className="p-3.5">Client & Compte</th>
                        <th className="p-3.5">Montant</th>
                        <th className="p-3.5">Niveau Risque</th>
                        <th className="p-3.5">Statut</th>
                        <th className="p-3.5 rounded-r-xl text-right">Actions SuperAdmin</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80 text-slate-200">
                      {highRiskOps.map((op) => (
                        <tr key={op.id} className="hover:bg-slate-800/30 transition-colors">
                          <td className="p-3.5 font-medium">
                            <div className="text-white font-bold">{op.type}</div>
                            <div className="text-[11px] text-slate-400 font-mono">{op.reference}</div>
                          </td>
                          <td className="p-3.5">
                            <div className="text-white font-semibold">{op.client}</div>
                            <div className="text-[10px] text-slate-400 font-mono">{op.account}</div>
                          </td>
                          <td className="p-3.5 font-mono font-bold text-emerald-400">
                            {op.amount.toLocaleString('fr-FR')} TND
                          </td>
                          <td className="p-3.5">
                            <span className={`px-2.5 py-1 rounded font-mono text-[10px] font-bold ${
                              op.riskLevel === 'CRITIQUE' ? 'bg-rose-900/80 text-rose-300 border border-rose-700' : 'bg-amber-900/80 text-amber-300 border border-amber-700'
                            }`}>
                              {op.riskLevel}
                            </span>
                          </td>
                          <td className="p-3.5">
                            <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] ${
                              op.status === 'Approuvé' 
                                ? 'bg-emerald-900/80 text-emerald-300 border border-emerald-700' 
                                : op.status === 'Bloqué'
                                ? 'bg-rose-900/80 text-rose-300 border border-rose-700'
                                : 'bg-amber-900/80 text-amber-300 border border-amber-700 animate-pulse'
                            }`}>
                              {op.status.toUpperCase()}
                            </span>
                          </td>
                          <td className="p-3.5 text-right space-x-2">
                            {op.status === 'En Attente' ? (
                              <>
                                <button
                                  onClick={() => handleBlockOp(op.id, op.reference)}
                                  className="px-3 py-1 bg-rose-900/50 hover:bg-rose-800 text-rose-200 rounded-lg text-xs font-bold border border-rose-700 cursor-pointer"
                                >
                                  Bloquer
                                </button>
                                <button
                                  onClick={() => handleApproveOp(op.id, op.reference)}
                                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold shadow cursor-pointer"
                                >
                                  Approuver
                                </button>
                              </>
                            ) : (
                              <span className="text-slate-500 italic text-[11px]">Opération Traitée</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* VIEW 3: JOURNAL D'AUDIT TRAIL */}
          {activeTab === 'audit' && (
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Activity className="w-5 h-5 text-emerald-400" />
                    Journal d'Audit Trail Système
                  </h2>
                  <p className="text-xs text-slate-400">
                    Historique infalsifiable de toutes les connexions, modifications de paramètres et opérations sur le portail.
                  </p>
                </div>

                <div className="flex items-center space-x-3 w-full sm:w-auto">
                  <div className="flex items-center space-x-2">
                    <Filter className="w-4 h-4 text-slate-400" />
                    <select
                      value={auditFilter}
                      onChange={(e) => setAuditFilter(e.target.value)}
                      className="bg-slate-950 border border-slate-800 text-xs text-white rounded-xl px-3 py-1.5 focus:outline-none"
                    >
                      <option value="ALL">Tous les événements ({auditLogs.length})</option>
                      <option value="SUCCÈS">Succès uniquement</option>
                      <option value="ÉCHEC">Échecs</option>
                      <option value="ALERTE">Alertes</option>
                    </select>
                  </div>

                  <button
                    onClick={() => showToast('Export CSV généré avec succès.')}
                    className="bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs px-3 py-1.5 rounded-xl flex items-center space-x-1 cursor-pointer shadow"
                  >
                    <Download className="w-4 h-4" />
                    <span>Exporter CSV</span>
                  </button>
                </div>
              </div>

              {/* Logs List */}
              <div className="space-y-3">
                {filteredAuditLogs.length === 0 ? (
                  <div className="text-center py-8 text-slate-500 text-xs">
                    Aucun journal d'audit correspondant aux critères de recherche.
                  </div>
                ) : (
                  filteredAuditLogs.map((log) => (
                    <div
                      key={log.id}
                      className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span
                            className={`font-mono font-bold px-2 py-0.5 rounded text-[10px] ${
                              log.status === 'SUCCÈS'
                                ? 'bg-emerald-900/80 text-emerald-300'
                                : log.status === 'ÉCHEC'
                                ? 'bg-rose-900/80 text-rose-300'
                                : 'bg-amber-900/80 text-amber-300'
                            }`}
                          >
                            {log.status}
                          </span>
                          <span className="font-bold text-white">{log.action}</span>
                          <span className="text-slate-400 font-mono">({log.user})</span>
                        </div>
                        <p className="text-slate-300 text-xs">{log.details}</p>
                      </div>

                      <div className="text-right text-[11px] text-slate-400 font-mono shrink-0">
                        <div>{log.timestamp}</div>
                        <div className="text-slate-500">IP: {log.ipAddress}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* VIEW 4: GESTION DES ADMINS (CRUD) */}
          {activeTab === 'admins' && (
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Users className="w-5 h-5 text-emerald-400" />
                    Gestion des Administrateurs Système (Habilitations)
                  </h2>
                  <p className="text-xs text-slate-400">
                    Créez, modifiez, désactivez ou supprimez des profils administrateurs BNA.
                  </p>
                </div>

                <button
                  onClick={handleOpenAddAdmin}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center space-x-2 cursor-pointer shadow transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Nouveau Compte Administrateur</span>
                </button>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 uppercase font-semibold">
                    <tr>
                      <th className="p-3.5 rounded-l-xl">Nom & Email</th>
                      <th className="p-3.5">Rôle / Profil</th>
                      <th className="p-3.5">Statut</th>
                      <th className="p-3.5">Dernière Connexion</th>
                      <th className="p-3.5 rounded-r-xl text-right">Actions CRUD</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80 text-slate-200">
                    {filteredAdmins.map((admin) => (
                      <tr key={admin.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="p-3.5">
                          <div className="text-white font-bold">{admin.name}</div>
                          <div className="text-[11px] text-slate-400">{admin.email}</div>
                        </td>
                        <td className="p-3.5">
                          <span className="bg-slate-800 text-emerald-300 font-mono font-bold px-2.5 py-1 rounded-lg text-[11px] border border-slate-700">
                            {admin.role}
                          </span>
                        </td>
                        <td className="p-3.5">
                          <button
                            onClick={() => handleToggleAdminStatus(admin.id, admin.name, admin.status)}
                            className={`px-3 py-1 rounded-full font-bold text-[10px] cursor-pointer transition-all ${
                              admin.status === 'actif'
                                ? 'bg-emerald-900/80 text-emerald-300 border border-emerald-700 hover:bg-emerald-800'
                                : 'bg-rose-900/80 text-rose-300 border border-rose-700 hover:bg-rose-800'
                            }`}
                          >
                            {admin.status.toUpperCase()}
                          </button>
                        </td>
                        <td className="p-3.5 font-mono text-slate-400 text-[11px]">
                          {admin.lastLogin}
                        </td>
                        <td className="p-3.5 text-right space-x-2">
                          <button
                            onClick={() => handleOpenEditAdmin(admin)}
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-all cursor-pointer border border-slate-700"
                            title="Modifier"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeletingAdminId(admin.id)}
                            className="p-1.5 bg-rose-900/40 hover:bg-rose-800 text-rose-300 rounded-lg transition-all cursor-pointer border border-rose-800/50"
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* VIEW 5: ENTITÉS & CRUD (COMPTES CLIENTS, AGENCES, ROLES) */}
          {activeTab === 'entities' && (
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-6">
              
              {/* Header & Sub-Tabs */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-emerald-400" />
                    Gestion des Entités BNA & Opérations CRUD
                  </h2>
                  <p className="text-xs text-slate-400">
                    Administration des comptes clients, réseau d'agences physiques et matrice de droits.
                  </p>
                </div>

                <div className="flex items-center space-x-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
                  <button
                    onClick={() => setEntitySubTab('accounts')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      entitySubTab === 'accounts' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Comptes Clients ({allAccounts.length})
                  </button>
                  <button
                    onClick={() => setEntitySubTab('agencies')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      entitySubTab === 'agencies' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Agences BNA ({branchesList.length})
                  </button>
                  <button
                    onClick={() => setEntitySubTab('roles')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      entitySubTab === 'roles' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Matrice des Rôles
                  </button>
                </div>
              </div>

              {/* SUB TAB 1: COMPTES CLIENTS */}
              {entitySubTab === 'accounts' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300">Liste des Comptes Bancaires</span>
                    <button
                      onClick={() => setShowAddAccountModal(true)}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1.5 rounded-xl text-xs flex items-center space-x-1 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Créer un Compte</span>
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-950 text-slate-400 uppercase font-semibold">
                        <tr>
                          <th className="p-3.5 rounded-l-xl">Numéro Compte & Type</th>
                          <th className="p-3.5">IBAN</th>
                          <th className="p-3.5">Solde</th>
                          <th className="p-3.5">Statut</th>
                          <th className="p-3.5 rounded-r-xl text-right">Action SuperAdmin</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/80 text-slate-200">
                        {filteredAccounts.map((acc) => (
                          <tr key={acc.id} className="hover:bg-slate-800/30 transition-colors">
                            <td className="p-3.5">
                              <div className="text-white font-mono font-bold">{acc.accountNumber}</div>
                              <div className="text-[11px] text-slate-400">{acc.type}</div>
                            </td>
                            <td className="p-3.5 font-mono text-slate-300 text-[11px]">{acc.iban}</td>
                            <td className="p-3.5 font-mono font-bold text-emerald-400">
                              {acc.balance.toLocaleString('fr-FR')} {acc.currency}
                            </td>
                            <td className="p-3.5">
                              <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] ${
                                acc.status === 'active' 
                                  ? 'bg-emerald-900/80 text-emerald-300 border border-emerald-700' 
                                  : 'bg-rose-900/80 text-rose-300 border border-rose-700'
                              }`}>
                                {acc.status.toUpperCase()}
                              </span>
                            </td>
                            <td className="p-3.5 text-right">
                              <button
                                onClick={() => handleToggleAccountStatus(acc.id, acc.accountNumber, acc.status)}
                                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                  acc.status === 'active'
                                    ? 'bg-rose-900/50 hover:bg-rose-800 text-rose-200 border border-rose-700'
                                    : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                                }`}
                              >
                                {acc.status === 'active' ? 'Verrouiller' : 'Déverrouiller'}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* SUB TAB 2: AGENCES BNA */}
              {entitySubTab === 'agencies' && (
                <div className="space-y-4">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-950 text-slate-400 uppercase font-semibold">
                        <tr>
                          <th className="p-3.5 rounded-l-xl">Code & Nom Agence</th>
                          <th className="p-3.5">Région BNA</th>
                          <th className="p-3.5">Directeur Agence</th>
                          <th className="p-3.5">Nombre Clients</th>
                          <th className="p-3.5 rounded-r-xl">Statut</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/80 text-slate-200">
                        {branchesList.map((branch) => (
                          <tr key={branch.id} className="hover:bg-slate-800/30 transition-colors">
                            <td className="p-3.5">
                              <div className="text-white font-bold">{branch.name}</div>
                              <div className="text-[11px] text-slate-400 font-mono">Code: {branch.code}</div>
                            </td>
                            <td className="p-3.5 text-slate-300">{branch.region}</td>
                            <td className="p-3.5 text-white font-medium">{branch.manager}</td>
                            <td className="p-3.5 font-mono text-emerald-400 font-bold">{branch.clientCount.toLocaleString('fr-FR')}</td>
                            <td className="p-3.5">
                              <span className="bg-emerald-900/80 text-emerald-300 font-bold px-2.5 py-1 rounded-full text-[10px] border border-emerald-700">
                                {branch.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* SUB TAB 3: MATRICE DES ROLES */}
              {entitySubTab === 'roles' && (
                <div className="space-y-4">
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-4 text-xs">
                    <h3 className="font-bold text-white text-sm">Matrice des Matriçages Droits & Habilitations</h3>
                    
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead className="bg-slate-900 text-slate-400 font-semibold uppercase">
                          <tr>
                            <th className="p-3">Module / Fonctionnalité</th>
                            <th className="p-3">Super Admin</th>
                            <th className="p-3">Admin BNA</th>
                            <th className="p-3">Client Pro</th>
                            <th className="p-3">Client Particulier</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/80 text-slate-300">
                          <tr>
                            <td className="p-3 font-bold text-white">Gestion Utilisateurs & Admins</td>
                            <td className="p-3 text-emerald-400 font-bold">ACCÈS TOTAL</td>
                            <td className="p-3 text-amber-400 font-bold">LECTURE SEULE</td>
                            <td className="p-3 text-slate-600">INTERDIT</td>
                            <td className="p-3 text-slate-600">INTERDIT</td>
                          </tr>
                          <tr>
                            <td className="p-3 font-bold text-white">Validation Virements Haut Risque</td>
                            <td className="p-3 text-emerald-400 font-bold">ACCÈS TOTAL</td>
                            <td className="p-3 text-emerald-400 font-bold">JUSQU'À 50K TND</td>
                            <td className="p-3 text-slate-600">INTERDIT</td>
                            <td className="p-3 text-slate-600">INTERDIT</td>
                          </tr>
                          <tr>
                            <td className="p-3 font-bold text-white">Gestion Crédits Agricoles & Effets</td>
                            <td className="p-3 text-emerald-400 font-bold">ACCÈS TOTAL</td>
                            <td className="p-3 text-emerald-400 font-bold">VALIDATION</td>
                            <td className="p-3 text-emerald-400 font-bold">DEMANDE / GESTION</td>
                            <td className="p-3 text-slate-600">NON ÉLIGIBLE</td>
                          </tr>
                          <tr>
                            <td className="p-3 font-bold text-white">Audit Trail System & Security Logs</td>
                            <td className="p-3 text-emerald-400 font-bold">ACCÈS TOTAL</td>
                            <td className="p-3 text-emerald-400 font-bold">CONSULTATION</td>
                            <td className="p-3 text-slate-600">INTERDIT</td>
                            <td className="p-3 text-slate-600">INTERDIT</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* VIEW 6: CONFIGURATION SYSTÈME */}
          {activeTab === 'config' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Form Config */}
              <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-6">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div>
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                      <Settings className="w-5 h-5 text-emerald-400" />
                      Configuration Globale de Sécurité & Réseau
                    </h2>
                    <p className="text-xs text-slate-400">
                      Paramètres d'authentification, plafonds d'exécution et règles de maintien du système.
                    </p>
                  </div>
                </div>

                <div className="space-y-4 text-xs">
                  
                  {/* Security Toggles */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-white">Double Facteur OTP Obligatoire</div>
                        <div className="text-[11px] text-slate-400">Exiger le SMS OTP à chaque connexion</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={requireOtp}
                        onChange={(e) => setRequireOtp(e.target.checked)}
                        className="w-4 h-4 accent-emerald-500 cursor-pointer"
                      />
                    </div>

                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-white">Anti Brute-Force IP Auto-Lock</div>
                        <div className="text-[11px] text-slate-400">Blocage automatique après 3 échecs</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={antiBruteForce}
                        onChange={(e) => setAntiBruteForce(e.target.checked)}
                        className="w-4 h-4 accent-emerald-500 cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Limits and Session Expiry */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">Durée d'Inactivité Session (Minutes)</label>
                      <input
                        type="number"
                        value={sessionDuration}
                        onChange={(e) => setSessionDuration(Number(e.target.value))}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 font-bold mb-1">Plafond Virement Instantané (TND)</label>
                      <input
                        type="number"
                        value={instantTransferLimit}
                        onChange={(e) => setInstantTransferLimit(Number(e.target.value))}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                      />
                    </div>
                  </div>

                  {/* Maintenance Mode */}
                  <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-bold text-white">Mode Maintenance Intersessions BNA</div>
                        <div className="text-slate-400 text-[11px]">Suspend l'accès client et verrouille l'exécution des ordres de virement.</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setMaintenanceMode(!maintenanceMode);
                          showToast(`Mode maintenance ${!maintenanceMode ? 'ACTIVÉ' : 'DÉSACTIVÉ'}`, !maintenanceMode ? 'error' : 'success');
                        }}
                        className={`px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                          maintenanceMode ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        {maintenanceMode ? 'Maintenance ACTIVE' : 'Normal (Inactif)'}
                      </button>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={handleSaveConfig}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-2.5 rounded-xl text-xs shadow cursor-pointer transition-all"
                    >
                      Enregistrer les Paramètres
                    </button>
                  </div>

                </div>
              </div>

              {/* Right Technical Summary */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-3">
                  Informations Réseau BNA
                </h3>

                <div className="space-y-3 text-xs">
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block mb-0.5">Fournisseur OTP SMS</span>
                    <span className="text-white font-bold">{otpProvider}</span>
                  </div>

                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block mb-0.5">Fréquence de Sauvegarde Base</span>
                    <span className="text-white font-bold">{backupFrequency}</span>
                  </div>

                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block mb-0.5">Certificat SSL / TLS</span>
                    <span className="text-emerald-400 font-bold">Valide jusqu'au 31/12/2027</span>
                  </div>
                </div>
              </div>

            </div>
          )}

        </main>
      </div>

      {/* MODAL 1: ADD/EDIT ADMIN */}
      {showAddAdminModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">
                {editingAdmin ? 'Modifier Administrateur' : 'Nouveau Compte Administrateur'}
              </h3>
              <button 
                onClick={() => setShowAddAdminModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAdmin} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Nom complet</label>
                <input
                  type="text"
                  required
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  placeholder="ex: Dr. Houcine Ben Said"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Adresse Email BNA</label>
                <input
                  type="email"
                  required
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="ex: houcine.bensaid@bna.tn"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Rôle / Profil</label>
                <select
                  value={adminRole}
                  onChange={(e) => setAdminRole(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="Admin">Admin Fonctionnel</option>
                  <option value="Support">Support Technique</option>
                  <option value="Auditeur">Auditeur Conformité</option>
                </select>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddAdminModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 font-bold rounded-xl hover:bg-slate-700"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow"
                >
                  {editingAdmin ? 'Enregistrer' : 'Créer Compte'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: DELETE ADMIN CONFIRMATION */}
      {deletingAdminId && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl text-center">
            <div className="p-3 bg-rose-500/10 text-rose-400 rounded-full w-12 h-12 mx-auto flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Confirmation de Suppression</h3>
              <p className="text-xs text-slate-400 mt-1">
                Êtes-vous sûr de vouloir supprimer définitivement cet administrateur ? Cette action sera consignée dans l'audit trail.
              </p>
            </div>
            <div className="flex items-center justify-center space-x-3 pt-2">
              <button
                onClick={() => setDeletingAdminId(null)}
                className="px-4 py-2 bg-slate-800 text-slate-300 font-bold text-xs rounded-xl hover:bg-slate-700"
              >
                Annuler
              </button>
              <button
                onClick={handleDeleteAdminConfirm}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: ADD CLIENT ACCOUNT */}
      {showAddAccountModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Nouveau Compte Client BNA</h3>
              <button 
                onClick={() => setShowAddAccountModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddAccountSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Numéro de Compte (16 à 20 chiffres)</label>
                <input
                  type="text"
                  required
                  value={newAccNum}
                  onChange={(e) => setNewAccNum(e.target.value)}
                  placeholder="ex: 03 001 0005544332 11"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Type de Compte</label>
                <select
                  value={newAccType}
                  onChange={(e) => setNewAccType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="Compte Chèque Particulier">Compte Chèque Particulier</option>
                  <option value="Compte Épargne BNA Moussafir">Compte Épargne BNA Moussafir</option>
                  <option value="Compte Courant Professionnel Agricole">Compte Courant Professionnel Agricole</option>
                  <option value="Compte Devise Convertible (Export)">Compte Devise Convertible (Export)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Solde Initial (TND)</label>
                <input
                  type="number"
                  required
                  value={newAccBalance}
                  onChange={(e) => setNewAccBalance(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddAccountModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 font-bold rounded-xl hover:bg-slate-700"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow"
                >
                  Créer Compte
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: SUPER ADMIN EXCLUSIVE DATABASE VIEWER & SQL EXPORT */}
      <DatabaseViewerModal
        isOpen={isDbViewerModalOpen}
        onClose={() => setIsDbViewerModalOpen(false)}
      />

    </div>
  );
};
